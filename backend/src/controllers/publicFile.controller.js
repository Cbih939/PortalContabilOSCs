import pool from '../config/db.js';

export const uploadFile = async (req, res) => {
  try {
    // Captura os ficheiros (usando .any() ou .fields())
    const files = req.files || [];
    
    // Filtramos para encontrar qual é o PDF e qual é a Capa
    const pdfFile = files.find(f => f.fieldname === 'file');
    const coverFile = files.find(f => f.fieldname === 'cover');

    if (!pdfFile) {
      return res.status(400).json({ message: 'O arquivo PDF é obrigatório.' });
    }

    const { title, category } = req.body;

    // Caminhos relativos para guardar na BD (removendo o prefixo absoluto do sistema)
    const file_path = pdfFile.path.split('backend/')[1] || pdfFile.path;
    const cover_path = coverFile ? (coverFile.path.split('backend/')[1] || coverFile.path) : null;

    // SQL atualizado com a coluna cover_path
    const [result] = await pool.execute(
      'INSERT INTO public_files (title, category, file_path, cover_path) VALUES (?, ?, ?, ?)',
      [
        title || pdfFile.originalname, 
        category || 'BIBLIOTECA', 
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
        // Opcional: Aqui poderia apagar os ficheiros físicos do disco também
        await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
        res.json({ message: 'Arquivo removido com sucesso.' });
    } catch (error) {
        console.error('[Delete Error]:', error);
        res.status(500).json({ message: 'Erro ao eliminar arquivo.' });
    }
};