import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

// Lista todos os modelos
export const getTemplates = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM templates ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('[GetTemplates Error]:', error);
        res.status(500).json({ message: 'Erro ao listar modelos.' });
    }
};

// Faz o upload de um novo modelo
export const uploadTemplate = async (req, res) => {
  try {
    const file = req.files && req.files.length > 0 ? req.files[0] : (req.file || null);
    if (!file) return res.status(400).json({ message: 'Nenhum ficheiro recebido.' });

    const { name, description } = req.body;
    const saved_filename = file.filename;
    const relativePath = file.path.split('backend/')[1] || file.path;

    const [result] = await pool.execute(
      `INSERT INTO templates 
      (file_name, description, saved_filename, file_path, mime_type, file_size_bytes, uploaded_by_contador_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name || file.originalname, description || '', saved_filename, relativePath, file.mimetype, file.size, req.user?.id || null]
    );

    res.status(201).json({ message: 'Modelo enviado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('[Upload Template Error]:', error);
    res.status(500).json({ message: 'Erro ao processar upload.' });
  }
};

// Remove um modelo (A função que estava em falta)
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT file_path FROM templates WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const fullPath = path.join('/var/www/PortalContabilOSCs/backend/', rows[0].file_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await pool.execute('DELETE FROM templates WHERE id = ?', [id]);
    res.json({ message: 'Modelo removido com sucesso.' });
  } catch (error) {
    console.error('[Delete Template Error]:', error);
    res.status(500).json({ message: 'Erro ao remover modelo.' });
  }
};