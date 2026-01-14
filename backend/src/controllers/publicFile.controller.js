import pool from '../config/db.js';

export const uploadFile = async (req, res) => {
  try {
    // Captura o arquivo do array (usando .any() na rota)
    const file = req.files && req.files.length > 0 ? req.files[0] : null;

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo recebido pelo servidor.' });
    }

    const { title, category } = req.body;

    // SQL exato para as colunas: title, category, file_path
    const [result] = await pool.execute(
      'INSERT INTO public_files (title, category, file_path) VALUES (?, ?, ?)',
      [
        title || file.originalname, 
        category || 'BIBLIOTECA', 
        file.path // O Multer salva o caminho completo aqui
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

export const getFiles = async (req, res) => {
    try {
        // created_at existe, então podemos ordenar por ela
        const [rows] = await pool.execute('SELECT * FROM public_files ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('[GetFiles Error]:', error);
        res.status(500).json({ message: 'Erro ao listar arquivos.' });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
        res.json({ message: 'Arquivo removido com sucesso.' });
    } catch (error) {
        console.error('[Delete Error]:', error);
        res.status(500).json({ message: 'Erro ao eliminar arquivo.' });
    }
};