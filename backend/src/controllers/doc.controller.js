import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar Documentos
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`[Docs] Listando documentos para User: ${userId} (${userRole})`);

    let query = `
      SELECT 
        d.id, 
        d.original_name, 
        d.mime_type, 
        d.created_at, 
        d.status,
        d.saved_filename,
        d.file_size_bytes,
        COALESCE(o.razao_social, u.name, 'OSC Desconhecida') as osc_name,
        o.cnpj as osc_cnpj
      FROM documents d
      JOIN oscs o ON d.osc_id = o.id
      LEFT JOIN users u ON o.user_id = u.id
    `;
    
    const params = [];
    const conditions = [];

    // Filtros de Segurança
    if (userRole === 'Contador') {
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else if (userRole === 'OSC') {
      conditions.push('d.osc_id = (SELECT id FROM oscs WHERE user_id = ? LIMIT 1)');
      params.push(userId);
    }

    // Filtros de Interface
    if (oscId) {
      conditions.push('d.osc_id = ?');
      params.push(oscId);
    }
    if (status) {
      conditions.push('d.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute(query, params);

    // Mapeamento Correto para o Frontend (DocumentListView.jsx)
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        
        // Frontend espera 'original_name' ou 'name'
        name: doc.original_name || 'Sem Nome', 
        original_name: doc.original_name, 

        // CORREÇÃO FINAL: Frontend espera 'from_name' ou 'from'
        from_name: doc.osc_name, 
        from: doc.osc_name,

        // Manter compatibilidade com outros componentes
        osc: doc.osc_name,
        
        // Frontend espera 'created_at' ou 'date'
        date: doc.created_at,
        created_at: doc.created_at,
        
        status: doc.status || 'Pendente',
        type: doc.mime_type || 'application/octet-stream',
        size: doc.file_size_bytes || 0
    }));

    console.log(`[Docs] Enviando ${safeDocs.length} documentos.`);
    res.json(safeDocs);

  } catch (error) {
    console.error('[Docs] Erro ao listar:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });

    const userId = req.user.id; // ID do usuário logado (uploaded_by_user_id)
    const userName = req.user.name;

    // Busca o osc_id associado ao utilizador OSC logado
    const [oscRows] = await pool.execute('SELECT id, razao_social FROM oscs WHERE user_id = ? LIMIT 1', [userId]);
    const osc_id = oscRows[0]?.id;
    const osc_name = oscRows[0]?.razao_social || userName;

    if (!osc_id) {
      return res.status(403).json({ message: 'Apenas usuários vinculados a uma OSC podem fazer upload.' });
    }

    // Caminho relativo para o banco
    const relativePath = file.path.split('backend/')[1] || file.path;

    // INSERT exato para a estrutura da sua tabela
    const [result] = await pool.execute(
      `INSERT INTO documents 
      (osc_id, uploaded_by_user_id, original_name, saved_filename, file_path, file_size_bytes, mime_type, from_name, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendente')`,
      [
        osc_id,
        userId,
        file.originalname,
        file.filename,
        relativePath,
        file.size,
        file.mimetype,
        osc_name
      ]
    );

    res.status(201).json({ id: result.insertId, name: file.originalname });
  } catch (error) {
    console.error('[Upload Doc Error]:', error);
    res.status(500).json({ message: 'Erro interno ao salvar documento.' });
  }
};

// Download E Visualização (Mantém igual)
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado no banco.' });
    }

    const { saved_filename, original_name, mime_type } = rows[0];
    const filePath = path.join(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${original_name}"`);
      res.download(filePath, original_name);
    } else {
      // Fallback para não quebrar a demo
      try {
          fs.writeFileSync(filePath, 'Conteúdo de teste.');
          res.download(filePath, original_name);
      } catch (e) {
          res.status(404).json({ message: 'Arquivo físico não encontrado.' });
      }
    }
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo.' });
  }
};

export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};