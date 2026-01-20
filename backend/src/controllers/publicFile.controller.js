import pool from '../config/db.js';

// Listar arquivos públicos (Com filtro opcional por categoria)
export const getFiles = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = '';
    let params = [];

    // Se tiver categoria na URL (ex: ?category=BIBLIOTECA)
    if (category) {
      // ATENÇÃO: Usamos SELECT * para garantir que 'ebook_category' venha junto
      query = `
        SELECT id, title, file_path, cover_path, category, created_at, ebook_category 
        FROM public_files 
        WHERE category = ? 
        ORDER BY created_at DESC
      `;
      params = [category];
    } else {
      // Se não tiver categoria, traz tudo
      query = `
        SELECT id, title, file_path, cover_path, category, created_at, ebook_category 
        FROM public_files 
        ORDER BY created_at DESC
      `;
    }

    const [rows] = await pool.execute(query, params);

    console.log(`[PublicFiles] Buscando categoria: ${category || 'Todas'}. Encontrados: ${rows.length}`);
    
    // Log para depuração: verifique se o primeiro item tem ebook_category
    if (rows.length > 0) {
        console.log('[DEBUG] Exemplo do arquivo:', rows[0]);
    }

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar arquivos públicos:', error);
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
  }
};

// Deletar arquivo (Apenas Admin)
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Buscar o arquivo para deletar do disco (opcional, se quiser limpar a pasta uploads)
    // const [files] = await pool.execute('SELECT file_path, cover_path FROM public_files WHERE id = ?', [id]);
    
    // 2. Deletar do banco
    await pool.execute('DELETE FROM public_files WHERE id = ?', [id]);

    res.json({ message: 'Arquivo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ message: 'Erro ao deletar arquivo.' });
  }
};