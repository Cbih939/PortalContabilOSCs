import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- LISTAR DOCUMENTOS (Ajustado para retornar documentos vinculados à OSC) ---
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status, type } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Query base que traz os documentos e informações da OSC
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

    // Segurança: Contador vê apenas suas OSCs, OSC vê apenas seus próprios documentos
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
    console.error('[Docs] Erro ao listar:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// --- BUSCAR DOCUMENTOS RECEBIDOS (Mapeamento para o carrossel do Contador) ---
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
      file_path: `uploads/${doc.saved_filename}`
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[Docs Received] Erro:', error);
    res.status(500).json({ message: 'Erro ao buscar documentos recebidos.' });
  }
};

// --- UPLOAD DE DOCUMENTO (Ajustado para fluxo bidirecional Contador <-> OSC) ---
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const userId = req.user.id;
    const userRole = req.user.role;
    const { doc_type, osc_id: bodyOscId } = req.body; 

    let finalOscId;
    let targetContadorId;

    // Se o Contador estiver fazendo o upload para uma OSC específica
    if (userRole === 'Contador' && bodyOscId) {
      finalOscId = bodyOscId;
      const [oscRows] = await pool.execute('SELECT assigned_contador_id FROM oscs WHERE id = ?', [finalOscId]);
      targetContadorId = userId; 
    } else {
      // Fluxo normal: OSC enviando para seu contador
      const [oscRows] = await pool.execute(
        'SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', 
        [userId]
      );
      if (oscRows.length === 0) return res.status(403).json({ message: 'OSC não encontrada.' });
      finalOscId = oscRows[0].id;
      targetContadorId = oscRows[0].assigned_contador_id;
    }

    // REGRA: Limite de 20 documentos mensais (Apenas para uploads da OSC)
    if (userRole === 'OSC' && doc_type === 'MENSAL') {
      const [countRows] = await pool.execute(
        `SELECT COUNT(*) as total FROM documents 
         WHERE osc_id = ? AND doc_type = 'MENSAL' 
         AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
         AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
        [finalOscId]
      );

      if (countRows[0].total >= 20) {
        return res.status(400).json({ message: 'Limite de 20 documentos mensais atingido.' });
      }
    }

    // INSERT completo para evitar Erro 500 (Unknown column file_path etc)
    const [result] = await pool.execute(
      `INSERT INTO documents 
       (osc_id, uploaded_by_user_id, doc_type, original_name, saved_filename, file_path, file_size_bytes, mime_type, to_contador_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENVIADO')`,
      [
        finalOscId, 
        userId, 
        doc_type || 'MENSAL', 
        req.file.originalname, 
        req.file.filename, 
        req.file.path || `uploads/${req.file.filename}`, 
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

// --- CONCLUIR MÊS (Check do Contador) ---
export const markMonthAsConcluded = async (req, res) => {
  try {
    const { oscId } = req.body;
    if (!oscId) return res.status(400).json({ message: 'ID da OSC não fornecido.' });

    // Atualiza todos os documentos MENSAL do mês atual para CONCLUIDO
    const [result] = await pool.execute(
      `UPDATE documents SET status = 'CONCLUIDO' 
       WHERE osc_id = ? AND doc_type = 'MENSAL' 
       AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(created_at) = YEAR(CURRENT_DATE())`,
      [oscId]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Nenhum documento mensal encontrado para concluir neste mês.' });
    }

    res.json({ message: 'Mês marcado como concluído com sucesso.' });
  } catch (error) {
    console.error('[Conclude] Erro:', error);
    res.status(500).json({ message: 'Erro ao concluir mês.' });
  }
};

// --- DOWNLOAD ---
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const { saved_filename, original_name } = rows[0];
    const filePath = path.join(__dirname, '../../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, original_name);
    } else {
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