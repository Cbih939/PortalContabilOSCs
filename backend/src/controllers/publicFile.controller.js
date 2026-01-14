import pool from '../config/db.js';

export const uploadFile = async (req, res) => {
  try {
    // Debug para ver o que está chegando no terminal do PM2
    console.log('[Upload] Body:', req.body);
    console.log('[Upload] Files:', req.files);

    // Como usamos upload.any(), o arquivo vem em req.files (array)
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    if (!file) {
      return res.status(400).json({ 
        message: 'Nenhum arquivo recebido pelo servidor. Verifique o FormData no Frontend.' 
      });
    }

    const { title, category, description } = req.body;

    // Salvar no Banco de Dados (Ajuste as colunas se necessário para o commit d60403a)
    const [result] = await pool.execute(
      'INSERT INTO public_files (title, category, description, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)',
      [
        title || file.originalname, 
        category || 'Geral', 
        description || '', 
        file.path, 
        file.mimetype, 
        file.size
      ]
    );

    res.status(201).json({
      message: 'Upload realizado com sucesso!',
      fileId: result.insertId
    });

  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar upload.' });
  }
};

// Implementação simples para o getFiles não quebrar o teste
export const getFiles = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM public_files ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar arquivos.' });
    }
};

// Implementação simples para o deleteFile
export const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
        res.json({ message: 'Arquivo removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao eliminar arquivo.' });
    }
};