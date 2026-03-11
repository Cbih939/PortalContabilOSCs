import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- LISTAR DOCUMENTOS ---
export const getDocuments = async (req, res) => {
  try {
    const { oscId, year } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT d.*, 
             d.created_at as createdAt, 
             o.razao_social as osc_name
      FROM documents d
      INNER JOIN oscs o ON d.osc_id = o.id
    `;
    
    const params = [];
    const conditions = [];

    if (userRole === 'Contador') {
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }

    if (oscId) { conditions.push('d.osc_id = ?'); params.push(oscId); }
    if (year) { conditions.push('d.ref_year = ?'); params.push(year); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.ref_year DESC, d.ref_month DESC, d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar documentos das OSCs.' });
  }
};

export const getReceivedDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT d.*, u.name as sender_name, o.razao_social
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      JOIN users u ON d.uploaded_by_user_id = u.id
      WHERE o.assigned_contador_id = ?
      ORDER BY d.created_at DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    
    const formatted = rows.map(doc => ({
      id: doc.id,
      title: doc.original_name,
      original_name: doc.original_name,
      sender_name: doc.razao_social || doc.sender_name,
      created_at: doc.created_at,
      file_path: doc.saved_filename 
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('[Docs Received] Erro:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
}

/**
 * --- UPLOAD DE DOCUMENTO ---
 */
export const uploadDocument = async (req, res) => {
  try {
    const { osc_id, doc_type, ref_month, ref_year } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const query = `
      INSERT INTO documents 
      (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Agora passamos também o tamanho e o tipo de ficheiro!
    await pool.execute(query, [
      osc_id,
      file.originalname,
      file.filename,
      file.path,
      doc_type,
      ref_month,
      ref_year,
      'PENDENTE',
      userId,
      file.size || 0,
      file.mimetype || 'application/pdf'
    ]);

    res.status(201).json({ message: 'Documento enviado com sucesso!' });
  } catch (error) {
    console.error('[Document Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao salvar documento no banco.' });
  }
};

// --- CONCLUIR PERÍODO (Mês/Ano Específico) ---
export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId, month, year } = req.body;
    
    if (!oscId || !month || !year) {
      return res.status(400).json({ message: 'OSC, Mês e Ano de referência são obrigatórios.' });
    }

    const [result] = await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' 
       WHERE osc_id = ? AND doc_type = 'MENSAL' 
       AND ref_month = ? AND ref_year = ?`,
      [oscId, month, year]
    );

    res.json({ 
      message: `Mês ${month}/${year} concluído com sucesso.`, 
      updatedRows: result.affectedRows 
    });
  } catch (error) {
    console.error('[ERROR Conclude]:', error);
    res.status(500).json({ message: 'Erro interno ao concluir mês.' });
  }
};

// --- DOWNLOAD / VISUALIZAÇÃO ---
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    const { saved_filename, original_name, mime_type } = rows[0];
    const filePath = path.resolve(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${original_name}"`);
      return res.sendFile(filePath);
    } else {
      console.error('Arquivo físico não encontrado:', filePath);
      return res.status(404).json({ message: 'Arquivo físico não encontrado.' });
    }
  } catch (error) {
    console.error('[Download Error]:', error);
    res.status(500).json({ message: 'Erro ao processar o documento.' });
  }
};

// --- MARCAR COMO CONCLUSO TEC (MENSAL OU ANUAL) ---
export const markConclusoTec = async (req, res) => {
  try {
    const { osc_id, month, year } = req.body;
    const userId = req.user.id;
    
    if (!osc_id || !year) {
      return res.status(400).json({ message: "OSC e Ano são obrigatórios." });
    }

    const fileName = 'Histórico TEC - Transferência de Escritório';
    const docType = 'CONCLUSO TEC';
    const status = 'CONCLUIDO';

    if (month === 'ALL') {
      // Marca o ANO TODO (insere 12 registos) com tamanho 0 e mime_type text/plain
      for (let m = 1; m <= 12; m++) {
        await pool.execute(
          `INSERT INTO documents (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [osc_id, fileName, 'none', 'none', docType, m, year, status, userId, 0, 'text/plain']
        );
      }
    } else {
      // Marca apenas o MÊS SELECIONADO
      await pool.execute(
        `INSERT INTO documents (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status, uploaded_by_user_id, file_size_bytes, mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [osc_id, fileName, 'none', 'none', docType, month, year, status, userId, 0, 'text/plain']
      );
    }

    res.json({ message: 'Histórico TEC registrado com sucesso!' });
  } catch (error) {
    console.error('[markConclusoTec Error]:', error);
    res.status(500).json({ message: 'Erro interno ao marcar TEC.' });
  }
};