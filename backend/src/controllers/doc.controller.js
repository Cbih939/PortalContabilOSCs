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

    // INNER JOIN garante que apenas documentos de OSCs vinculadas ao contador apareçam
    let query = `
      SELECT d.*, 
             d.created_at as createdAt, 
             o.razao_social as osc_name
      FROM documents d
      INNER JOIN oscs o ON d.osc_id = o.id
    `;
    
    const params = [];
    const conditions = [];

    // Filtro de Segurança: Contador vê suas OSCs vinculadas, OSC vê seus próprios docs
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
      // IMPORTANTE: Retornamos apenas o saved_filename para evitar duplicidade de "uploads/uploads/"
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
 * CORREÇÃO: Salva caminhos consistentes
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const userId = req.user.id;
    const userRole = req.user.role;
    const { doc_type, osc_id: bodyOscId, ref_month, ref_year } = req.body; 

    let finalOscId;
    let targetContadorId;

    if (userRole === 'Contador' && bodyOscId) {
      finalOscId = bodyOscId;
      const [oscRows] = await pool.execute('SELECT assigned_contador_id FROM oscs WHERE id = ?', [finalOscId]);
      targetContadorId = userId; 
    } else {
      const [oscRows] = await pool.execute('SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', [userId]);
      if (oscRows.length === 0) return res.status(403).json({ message: 'OSC não encontrada.' });
      finalOscId = oscRows[0].id;
      targetContadorId = oscRows[0].assigned_contador_id;
    }

    const monthRef = ref_month || (new Date().getMonth() + 1);
    const yearRef = ref_year || new Date().getFullYear();

    const [result] = await pool.execute(
      `INSERT INTO documents 
        (osc_id, uploaded_by_user_id, doc_type, ref_month, ref_year, original_name, saved_filename, file_path, file_size_bytes, mime_type, to_contador_id, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENVIADO')`,
      [
        finalOscId, 
        userId, 
        doc_type || 'MENSAL',
        monthRef,
        yearRef,
        req.file.originalname, 
        req.file.filename, 
        req.file.filename, // Guardamos apenas o nome do arquivo aqui para simplificar
        req.file.size, 
        req.file.mimetype, 
        targetContadorId
      ]
    );

    res.status(201).json({ message: 'Enviado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar upload.' });
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

/**
 * --- DOWNLOAD ---
 * CORREÇÃO: Usa caminho absoluto baseado na raiz do projeto
 */
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const { saved_filename, original_name } = rows[0];
    
    // CORREÇÃO DE CAMINHO: path.resolve garante que ele ache a pasta uploads na raiz do backend
    const filePath = path.resolve(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, original_name);
    } else {
      console.error('Arquivo não encontrado no disco:', filePath);
      res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('[Download Error]:', error);
    res.status(500).json({ message: 'Erro ao processar download.' });
  }
};

// --- ATUALIZAR STATUS MANUAL ---
export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado para ${status}.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};