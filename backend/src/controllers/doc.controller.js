import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDocuments = async (req, res) => {
  try {
    const { oscId, status, type, year } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT d.*, 
             d.created_at as createdAt, 
             COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name
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
    if (year) { conditions.push('d.ref_year = ?'); params.push(year); }

    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY d.ref_year DESC, d.ref_month DESC, d.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const userId = req.user.id;
    const userRole = req.user.role;
    // Novos campos: ref_month e ref_year vindos do frontend
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

    // Se não enviado, usa o mês/ano atual como fallback
    const monthRef = ref_month || (new Date().getMonth() + 1);
    const yearRef = ref_year || new Date().getFullYear();

    // Regra de 20 documentos baseada na competência escolhida
    if (userRole === 'OSC' && doc_type === 'MENSAL') {
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM documents 
         WHERE osc_id = ? AND doc_type = 'MENSAL' 
         AND ref_month = ? AND ref_year = ?`,
        [finalOscId, monthRef, yearRef]
      );
      if (countRows[0].total >= 20) {
        return res.status(400).json({ message: 'Limite de 20 documentos atingido para este período.' });
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO documents 
       (osc_id, uploaded_by_user_id, doc_type, ref_month, ref_year, original_name, saved_filename, file_path, file_size_bytes, mime_type, to_contador_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENVIADO')`,
      [
        finalOscId, userId, doc_type || 'MENSAL', 
        monthRef, yearRef,
        req.file.originalname, req.file.filename, req.file.path || `uploads/${req.file.filename}`, 
        req.file.size, req.file.mimetype, targetContadorId
      ]
    );

    res.status(201).json({ message: 'Enviado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar upload.' });
  }
};

export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId, month, year } = req.body;
    
    if (!oscId || !month || !year) {
      return res.status(400).json({ message: 'OSC, Mês e Ano são obrigatórios.' });
    }

    const [result] = await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' 
       WHERE osc_id = ? AND doc_type = 'MENSAL' 
       AND ref_month = ? AND ref_year = ?`,
      [oscId, month, year]
    );

    res.json({ message: 'Período concluído com sucesso.', updatedRows: result.affectedRows });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao concluir período.' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Não encontrado.' });
    const filePath = path.join(__dirname, '../../../uploads', rows[0].saved_filename);
    res.download(filePath, rows[0].original_name);
  } catch (error) {
    res.status(500).json({ message: 'Erro no download.' });
  }
};

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