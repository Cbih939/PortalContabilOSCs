import pool from '../config/db.js';

// Listar arquivos públicos
export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    let query = '';
    let params = [];

    if (category) {
      query = `SELECT id, title, file_path, cover_path, category, created_at, ebook_category FROM public_files WHERE category = ? ORDER BY created_at DESC`;
      params = [category];
    } else {
      query = `SELECT id, title, file_path, cover_path, category, created_at, ebook_category FROM public_files ORDER BY created_at DESC`;
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

// --- AQUI ESTÁ A CORREÇÃO COM LOGS DE DEBUG ---
export const uploadFile = async (req, res) => {
  try {
    console.log('------------------------------------------------');
    console.log('[DEBUG Upload] Iniciando upload...');
    console.log('[DEBUG Upload] Body (Texto):', req.body);
    console.log('[DEBUG Upload] req.file (Single):', req.file ? 'Sim' : 'Não');
    console.log('[DEBUG Upload] req.files (Multiple):', req.files ? Object.keys(req.files) : 'Não');

    // Tenta encontrar o arquivo PDF em vários lugares possíveis
    let file = null;
    if (req.file) {
        file = req.file;
    } else if (req.files) {
        // Tenta achar campo com nome 'file', 'pdf', 'arquivo', 'document'
        file = req.files.file ? req.files.file[0] : 
               (req.files.pdf ? req.files.pdf[0] : 
               (req.files.arquivo ? req.files.arquivo[0] : null));
    }

    // Tenta encontrar a capa
    let cover = null;
    if (req.files) {
        cover = req.files.cover ? req.files.cover[0] : 
                (req.files.capa ? req.files.capa[0] : 
                (req.files.image ? req.files.image[0] : null));
    }

    if (!file) {
      console.error('[DEBUG Upload] ERRO: Nenhum arquivo PDF encontrado no request.');
      // Importante: Retorna qual campo o backend esperava vs o que recebeu
      return res.status(400).json({ 
          message: 'Nenhum arquivo PDF enviado ou nome do campo incorreto.',
          received_fields: req.files ? Object.keys(req.files) : 'Nenhum'
      });
    }

    const { title, category, ebook_category } = req.body;
    const filePath = file.path; 
    const coverPath = cover ? cover.path : null; 

    console.log(`[DEBUG Upload] Salvando no banco: ${title} | Sub: ${ebook_category}`);

    const [result] = await pool.execute(
      `INSERT INTO public_files (title, file_path, cover_path, category, ebook_category, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        title || file.originalname, 
        filePath, 
        coverPath, 
        category, 
        ebook_category || null 
      ]
    );

    console.log('[DEBUG Upload] Sucesso! ID:', result.insertId);

    res.status(201).json({ 
      message: 'Upload realizado com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[DEBUG Upload] Erro CRÍTICO:', error);
    res.status(500).json({ message: 'Erro interno ao salvar arquivo.' });
  }
};

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

