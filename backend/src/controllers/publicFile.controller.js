import pool from '../config/db.js';
import fs from 'fs';

/**
 * @desc    Publicar novo arquivo (Biblioteca/Modelos)
 */
export const uploadFile = async (req, res) => {
  console.log('Arquivos recebidos:', req.files);

  try {
    const { title, category } = req.body;
    const file = req.file || (req.files && req.files[0]);

    if (!file) {
        return res.status(400).json({ message: 'Nenhum arquivo recebido no controller.' });
    }

    // Ajuste o nome da tabela conforme o seu banco de dados
    const query = 'INSERT INTO public_files (title, category, file_path) VALUES (?, ?, ?)';
    await pool.execute(query, [title, category, file.path]);

    res.status(201).json({ message: 'Arquivo publicado com sucesso.' });
  } catch (error) {
    console.error('[PublicFile] Erro ao carregar:', error);
    res.status(500).json({ message: 'Erro ao salvar arquivo.' });
  }
};

/**
 * @desc    Listar arquivos (Corrige o erro 404 e trata a categoria vazia do Frontend)
 */
export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(`[PublicFile] Listando categoria: ${category || 'Todas'}`);

    let query = 'SELECT * FROM public_files';
    const params = [];

    // O frontend envia ?category= (vazio), por isso verificamos se o valor existe
    if (category && category !== '') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('[PublicFile] Erro ao buscar:', error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

/**
 * @desc    Remover arquivo do banco e do disco
 */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute('SELECT file_path FROM public_files WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const filePath = rows[0].file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
    res.status(200).json({ message: 'Arquivo excluído com sucesso.' });
  } catch (error) {
    console.error('[PublicFile] Erro ao excluir:', error);
    res.status(500).json({ message: 'Erro ao excluir arquivo.' });
  }
};