// --- VERIFIQUE ESTA LINHA ABAIXO ---
// Tenha certeza que o caminho para o seu db.js está correto.
// Se o seu arquivo de banco for 'database.js', mude aqui.
import pool from '../config/db.js'; 

// Listar arquivos públicos
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

    // console.log(`[PublicFiles] Arquivos encontrados: ${rows.length}`);
    res.json(rows);

  } catch (error) {
    console.error('Erro ao buscar arquivos públicos:', error);
    // Se o erro for de SQL (tabela ou coluna não existe), o servidor não cai, mas avisa aqui
    res.status(500).json({ message: 'Erro ao buscar arquivos.' });
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