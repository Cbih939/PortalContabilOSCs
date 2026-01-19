import pool from '../config/db.js';

export const uploadFile = async (req, res) => {
  try {
    // Captura os ficheiros
    const files = req.files || [];
    
    // Filtramos para encontrar qual é o PDF e qual é a Capa
    const pdfFile = files.find(f => f.fieldname === 'file');
    const coverFile = files.find(f => f.fieldname === 'cover');

    if (!pdfFile) {
      return res.status(400).json({ message: 'O arquivo PDF é obrigatório.' });
    }

    // 1. ADICIONE 'ebook_category' NA DESESTRUTURAÇÃO
    const { title, category, ebook_category } = req.body;

    // Caminhos relativos
    const file_path = pdfFile.path.split('backend/')[1] || pdfFile.path;
    const cover_path = coverFile ? (coverFile.path.split('backend/')[1] || coverFile.path) : null;

    // 2. ATUALIZE O SQL E OS PARÂMETROS
    // Adicionamos a coluna ebook_category e o valor correspondente (?)
    const [result] = await pool.execute(
      'INSERT INTO public_files (title, category, ebook_category, file_path, cover_path) VALUES (?, ?, ?, ?, ?)',
      [
        title || pdfFile.originalname, 
        category || 'BIBLIOTECA', 
        // Se vier vazio (undefined), salva o padrão 'E-book / PDF' ou null
        ebook_category || 'E-book / PDF', 
        file_path,
        cover_path
      ]
    );

    res.status(201).json({
      message: 'Upload realizado com sucesso!',
      fileId: result.insertId,
      cover_path
    });

  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar upload.' });
  }
};

export const getFiles = async (req, res) => {
    try {
        // Como você está usando SELECT *, a nova coluna virá automaticamente
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