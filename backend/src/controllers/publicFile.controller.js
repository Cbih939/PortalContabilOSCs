import pool from '../config/db.js';

// 1. Listar arquivos públicos (Com a correção do ebook_category)
export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = '';
    let params = [];

    if (category) {
      // Busca filtrada (trazendo a coluna ebook_category)
      query = `
        SELECT id, title, file_path, cover_path, category, created_at, ebook_category 
        FROM public_files 
        WHERE category = ? 
        ORDER BY created_at DESC
      `;
      params = [category];
    } else {
      // Busca completa
      query = `
        SELECT id, title, file_path, cover_path, category, created_at, ebook_category 
        FROM public_files 
        ORDER BY created_at DESC
      `;
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar arquivos públicos:', error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

// 2. Upload de Arquivo (ESTA ERA A FUNÇÃO QUE FALTAVA)
export const uploadFile = async (req, res) => {
  try {
    // Pega os dados do formulário
    const { title, category, ebook_category } = req.body;
    
    // Verifica se o arquivo principal (PDF) veio
    // Nota: Dependendo do seu Multer, pode vir em req.file ou req.files['file'][0]
    const file = req.files ? (req.files.file ? req.files.file[0] : req.file) : req.file;
    const cover = req.files && req.files.cover ? req.files.cover[0] : null;

    if (!file) {
      return res.status(400).json({ message: 'Nenhum arquivo PDF enviado.' });
    }

    const filePath = file.path; // Caminho salvo pelo Multer
    const coverPath = cover ? cover.path : null; // Caminho da capa, se houver

    // Insere no banco de dados incluindo a nova coluna ebook_category
    const [result] = await pool.execute(
      `INSERT INTO public_files (title, file_path, cover_path, category, ebook_category, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        title || file.originalname, 
        filePath, 
        coverPath, 
        category, 
        ebook_category || null // Salva a subcategoria (Governança, Contábil, etc)
      ]
    );

    res.status(201).json({ 
      message: 'Upload realizado com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('Erro no upload de arquivo público:', error);
    res.status(500).json({ message: 'Erro ao salvar arquivo no banco.' });
  }
};

// 3. Deletar arquivo
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);
    res.json({ message: 'Arquivo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ message: 'Erro ao deletar arquivo.' });
  }
};