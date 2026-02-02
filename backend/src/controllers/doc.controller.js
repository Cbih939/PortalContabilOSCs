import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDocuments = async (req, res) => {
  try {
    const { oscId, status, type } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT d.*, COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];

    if (userRole === 'Contador') {
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else if (userRole === 'OSC') {
      conditions.push('o.user_id = ?');
      params.push(userId);
    }

    if (oscId) { conditions.push('d.osc_id = ?'); params.push(oscId); }
    if (status) { conditions.push('d.status = ?'); params.push(status); }
    if (type) { conditions.push('d.doc_type = ?'); params.push(type); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// --- NOVO: BUSCAR DOCUMENTOS RECEBIDOS (Para o Contador) ---
export const getReceivedDocuments = async (req, res) => {
  try {
    const userId = req.user.id; // ID do Contador logado

    const query = `
      SELECT 
        d.*, 
        u.name as sender_name,
        o.razao_social
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE o.assigned_contador_id = ?
      ORDER BY d.created_at DESC
    `;

    const [rows] = await pool.execute(query, [userId]);
    
    // Mapeamento para o carrossel do Contador
    const formatted = rows.map(doc => ({
      id: doc.id,
      title: doc.original_name,
      original_name: doc.original_name,
      sender_name: doc.razao_social || doc.sender_name,
      created_at: doc.created_at,
      file_path: `uploads/${doc.saved_filename}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[Docs Received] Erro:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const userId = req.user.id;
    const { doc_type } = req.body; 

    // Busca dados da OSC e do Contador vinculado
    const [oscRows] = await pool.execute(
      'SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', 
      [userId]
    );
    
    if (oscRows.length === 0) return res.status(403).json({ message: 'OSC não encontrada.' });

    const osc_id = oscRows[0].id;
    const contador_id = oscRows[0].assigned_contador_id;

    // REGRA: Limite de 20 documentos mensais
    if (doc_type === 'MENSAL') {
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM documents 
         WHERE osc_id = ? AND doc_type = 'MENSAL' 
         AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
         AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
        [osc_id]
      );

      if (countRows[0].total >= 20) {
        return res.status(400).json({ message: 'Limite de 20 documentos mensais atingido.' });
      }
    }

    // INSERT ajustado para as colunas do seu DESCRIBE
    const [result] = await pool.execute(
      `INSERT INTO documents 
       (osc_id, uploaded_by_user_id, doc_type, original_name, saved_filename, file_path, file_size_bytes, mime_type, to_contador_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENVIADO')`,
      [
        osc_id, 
        userId, 
        doc_type || 'MENSAL', 
        req.file.originalname, 
        req.file.filename, 
        req.file.path, // Caminho gerado pelo multer
        req.file.size, 
        req.file.mimetype, 
        contador_id
      ]
    );

    res.status(201).json({ message: 'Enviado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar upload.' });
  }
};

// NOVO: Marcar mês como Concluído (Check do Contador)
export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId } = req.body;
    await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' 
       WHERE osc_id = ? AND doc_type = 'MENSAL' 
       AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
      [oscId]
    );
    res.json({ message: 'Mês marcado como concluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao concluir mês.' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Não encontrado.' });
    const filePath = path.join(__dirname, '../../uploads', rows[0].saved_filename);
    res.download(filePath, rows[0].original_name);
  } catch (error) {
    res.status(500).json({ message: 'Erro no download.' });
  }
};

// --- ATUALIZAR STATUS ---
export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};