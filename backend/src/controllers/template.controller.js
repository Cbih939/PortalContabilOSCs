import pool from '../config/db.js';

export const uploadTemplate = async (req, res) => {
  try {
    // Captura o ficheiro do Multer
    const file = req.files && req.files.length > 0 ? req.files[0] : (req.file || null);

    if (!file) {
      return res.status(400).json({ message: 'Nenhum ficheiro recebido.' });
    }

    // Mapeamento dos campos baseado no DESCRIBE que você enviou
    const file_name = req.body.name || file.originalname;
    const description = req.body.description || '';
    const saved_filename = file.filename; // Nome gerado pelo Multer (ex: 17368...pdf)
    const relativePath = file.path.split('backend/')[1] || file.path;
    const mime_type = file.mimetype;
    const file_size_bytes = file.size;
    const uploaded_by_contador_id = req.user?.id || null; // Pega o ID do utilizador logado

    // INSERT exato para a estrutura da tabela 'templates'
    const [result] = await pool.execute(
      `INSERT INTO templates 
      (file_name, description, saved_filename, file_path, mime_type, file_size_bytes, uploaded_by_contador_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        file_name,
        description,
        saved_filename,
        relativePath,
        mime_type,
        file_size_bytes,
        uploaded_by_contador_id
      ]
    );

    res.status(201).json({ 
      message: 'Modelo enviado com sucesso!', 
      id: result.insertId 
    });

  } catch (error) {
    console.error('[Template Error]:', error);
    res.status(500).json({ message: 'Erro interno ao processar modelo no banco de dados.' });
  }
};

// Funções de listagem e exclusão (ajustadas para os nomes das colunas)
export const getTemplates = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM templates ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar modelos.' });
    }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Procurar o ficheiro para apagar do disco
    const [rows] = await pool.execute('SELECT file_path FROM templates WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      const fullPath = path.join('/var/www/PortalContabilOSCs/backend/', rows[0].file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // 2. Apagar do banco de dados
    await pool.execute('DELETE FROM templates WHERE id = ?', [id]);

    res.json({ message: 'Modelo apagado com sucesso.' });
  } catch (error) {
    console.error('[Delete Template Error]:', error);
    res.status(500).json({ message: 'Erro ao eliminar modelo.' });
  }
};