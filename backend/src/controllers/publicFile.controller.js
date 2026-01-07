import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

    const query = 'INSERT INTO public_files (title, category, file_path) VALUES (?, ?, ?)';
    await pool.execute(query, [title, category, file.path]);

    res.status(201).json({ message: 'Arquivo publicado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao salvar arquivo.' });
  }
};

export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM public_files';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Pega o caminho do arquivo para deletar do disco
    const [rows] = await pool.execute('SELECT file_path FROM public_files WHERE id = ?', [id]);
    if (rows.length > 0) {
      const filePath = rows[0].file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 2. Deleta do banco
    await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
    res.status(200).json({ message: 'Arquivo excluído.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir arquivo.' });
  }
};