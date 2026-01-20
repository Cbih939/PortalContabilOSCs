import pool from '../config/db.js';

// Listar arquivos
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

// --- UPLOAD INTELIGENTE (Detecta PDF e Imagem automaticamente) ---
export const uploadFile = async (req, res) => {
  try {
    console.log('[Upload] Iniciando processamento inteligente...');
    
    // Com upload.any(), req.files é sempre um ARRAY de arquivos
    const files = req.files || [];
    
    // 1. Procura o PDF (qualquer arquivo que tenha mimetype 'application/pdf')
    const pdfFile = files.find(f => f.mimetype === 'application/pdf');

    // 2. Procura a Capa (qualquer arquivo que comece com 'image/')
    const coverFile = files.find(f => f.mimetype.startsWith('image/'));

    if (!pdfFile) {
      console.error('[Upload] Erro: Nenhum PDF encontrado nos arquivos enviados.');
      return res.status(400).json({ 
          message: 'É obrigatório enviar um arquivo PDF.',
          received_files: files.map(f => `${f.fieldname} (${f.mimetype})`)
      });
    }

    const { title, category, ebook_category } = req.body;
    
    // Prepara os caminhos
    const filePath = pdfFile.path;
    const coverPath = coverFile ? coverFile.path : null;

    console.log(`[Upload] Salvando: ${title || pdfFile.originalname}`);
    console.log(`[Upload] PDF: ${filePath}`);
    console.log(`[Upload] Capa: ${coverPath || 'Sem capa'}`);
    console.log(`[Upload] Subcategoria: ${ebook_category}`);

    // Salva no Banco
    const [result] = await pool.execute(
      `INSERT INTO public_files (title, file_path, cover_path, category, ebook_category, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        title || pdfFile.originalname, 
        filePath, 
        coverPath, 
        category, 
        ebook_category || null 
      ]
    );

    res.status(201).json({ 
      message: 'Upload realizado com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[Upload] Erro Interno:', error);
    res.status(500).json({ message: 'Erro ao salvar arquivo no banco.' });
  }
};

// Deletar arquivo
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