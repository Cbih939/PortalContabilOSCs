import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- LISTAR DOCUMENTOS (Geral/Filtros) ---
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        d.*, 
        COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name,
        o.cnpj as osc_cnpj
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
      conditions.push('d.osc_id = (SELECT id FROM oscs WHERE user_id = ? LIMIT 1)');
      params.push(userId);
    }

    if (oscId) {
      conditions.push('d.osc_id = ?');
      params.push(oscId);
    }
    if (status) {
      conditions.push('d.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute(query, params);

    const safeDocs = rows.map(doc => ({
        id: doc.id,
        name: doc.original_name || 'Sem Nome', 
        from_name: doc.osc_name, 
        date: doc.created_at,
        status: doc.status || 'Pendente',
        type: doc.mime_type || 'application/octet-stream',
        size: doc.file_size_bytes || 0,
        file_path: doc.saved_filename // Necessário para a capa do PDF
    }));

    res.json(safeDocs);
  } catch (error) {
    console.error('[Docs] Erro ao listar:', error);
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

// --- UPLOAD DE DOCUMENTO (Com correção de uploaded_by_user_id) ---
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado.' });

    const userId = req.user.id;
    // Busca o ID da OSC vinculada ao usuário logado
    const [oscRows] = await pool.execute('SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', [userId]);
    
    if (oscRows.length === 0) return res.status(403).json({ message: 'Usuário não é uma OSC vinculada.' });

    const osc_id = oscRows[0].id;
    const receiver_id = oscRows[0].assigned_contador_id;

    const [result] = await pool.execute(
      `INSERT INTO documents 
       (original_name, saved_filename, mime_type, file_size_bytes, osc_id, receiver_id, uploaded_by_user_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendente')`,
      [
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        osc_id,
        receiver_id,
        userId, // <--- CORREÇÃO: Enviando o ID do usuário que fez o upload
      ]
    );

    res.status(201).json({ message: 'Documento enviado!', id: result.insertId });
  } catch (error) {
    console.error('[Upload] Erro:', error);
    res.status(500).json({ message: 'Erro ao processar upload.' });
  }
};

// --- DOWNLOAD E VISUALIZAÇÃO ---
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const { saved_filename, original_name, mime_type } = rows[0];
    const filePath = path.join(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime_type || 'application/octet-stream');
      res.download(filePath, original_name);
    } else {
      res.status(404).json({ message: 'Arquivo físico não encontrado.' });
    }
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ message: 'Erro ao baixar.' });
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