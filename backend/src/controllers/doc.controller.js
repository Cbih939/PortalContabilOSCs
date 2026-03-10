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
    const { osc_id, doc_type, ref_month, ref_year } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    // Grava no banco com o novo doc_type (aceita CONCLUSO TEC, etc.)
    const query = `
      INSERT INTO documents 
      (osc_id, original_name, saved_filename, file_path, doc_type, ref_month, ref_year, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [
      osc_id,
      file.originalname,
      file.filename,
      file.path,
      doc_type, // Ex: 'CONCLUSO TEC'
      ref_month,
      ref_year,
      'PENDENTE'
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

/**
 * --- DOWNLOAD ---
 * CORREÇÃO: Usa caminho absoluto baseado na raiz do projeto
 */
// --- DOWNLOAD / VISUALIZAÇÃO ---
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscamos os dados do documento
    const [rows] = await pool.execute(
      'SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', 
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado no banco de dados.' });
    }

    const { saved_filename, original_name, mime_type } = rows[0];
    
    // Caminho absoluto para a pasta uploads na raiz do projeto
    const filePath = path.resolve(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      // Configuramos o Content-Type para o navegador saber o que está abrindo (PDF, JPG, etc)
      res.setHeader('Content-Type', mime_type || 'application/pdf');
      
      // 'inline' abre no navegador, 'attachment' força o download
      res.setHeader('Content-Disposition', `inline; filename="${original_name}"`);

      // Enviamos o arquivo físico
      return res.sendFile(filePath);
    } else {
      console.error('Arquivo físico não encontrado:', filePath);
      return res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('[Download Error]:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação do documento.' });
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