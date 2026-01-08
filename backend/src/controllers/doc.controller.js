// backend/src/controllers/doc.controller.js
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar documentos (com filtros opcionais)
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        d.id, 
        d.title, 
        d.type, 
        d.created_at, 
        d.file_path,
        o.name as osc_name,
        o.cnpj as osc_cnpj
      FROM documents d
      LEFT JOIN oscs o ON d.osc_id = o.id
    `;
    
    // NOTA: Removida a coluna 'd.status' do SELECT porque não existe no banco.
    // Adicionaremos manualmente na resposta para o frontend não quebrar.

    const params = [];
    const conditions = [];

    // Se for OSC, vê apenas os seus
    if (userRole === 'OSC') {
      // Primeiro descobre o ID da OSC do usuário
      const [oscRows] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [userId]);
      if (oscRows.length === 0) {
        return res.json([]); // Sem OSC vinculada
      }
      conditions.push('d.osc_id = ?');
      params.push(oscRows[0].id);
    }
    // Se for Contador, vê os das OSCs que atende
    else if (userRole === 'Contador') {
      conditions.push('o.contador_id = ?');
      params.push(userId);
    }

    // Filtros de UI
    if (oscId) {
      conditions.push('d.osc_id = ?');
      params.push(oscId);
    }
    
    // Ignoramos o filtro de 'status' no SQL se a coluna não existe no banco
    // if (status) { ... } 

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await pool.execute(query, params);

    // Mapeia para adicionar o status fictício, já que o banco não tem
    const result = rows.map(row => ({
        ...row,
        status: 'Pendente' // Valor padrão para evitar erro no frontend
    }));

    res.json(result);

  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ message: 'Erro interno ao listar documentos.' });
  }
};

// Upload de Documento
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const { title, type, oscId } = req.body;
    
    // Se não vier oscId (upload pelo contador), ou se for a própria OSC
    let targetOscId = oscId;

    if (!targetOscId && req.user.role === 'OSC') {
        const [osc] = await pool.execute('SELECT id FROM oscs WHERE user_id = ?', [req.user.id]);
        if (osc.length > 0) targetOscId = osc[0].id;
    }

    if (!targetOscId) {
        return res.status(400).json({ message: 'OSC não identificada para vincular o documento.' });
    }

    // Inserção no banco (SEM a coluna status)
    const [result] = await pool.execute(
      'INSERT INTO documents (title, type, file_path, osc_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [
        title || req.file.originalname, 
        type || 'Outros', 
        req.file.filename, 
        targetOscId
      ]
    );

    res.status(201).json({ 
        id: result.insertId, 
        message: 'Documento enviado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Falha ao salvar documento.' });
  }
};

// Download de Documento
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT file_path, title FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    const filePath = path.join(__dirname, '../../uploads', rows[0].file_path);

    if (fs.existsSync(filePath)) {
      res.download(filePath, rows[0].title); // Opcional: usar o nome original
    } else {
      res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('Erro download:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo.' });
  }
};

// Excluir Documento
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Pegar info do arquivo para deletar do disco
    const [rows] = await pool.execute('SELECT file_path FROM documents WHERE id = ?', [id]);
    
    if (rows.length > 0) {
        const filePath = path.join(__dirname, '../../uploads', rows[0].file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // 2. Deletar do banco
    await pool.execute('DELETE FROM documents WHERE id = ?', [id]);

    res.json({ message: 'Documento excluído.' });
  } catch (error) {
    console.error('Erro delete:', error);
    res.status(500).json({ message: 'Erro ao excluir documento.' });
  }
};

// Atualizar Status (Placeholder - já que a coluna não existe)
export const updateDocumentStatus = async (req, res) => {
    // Como não temos coluna status, retornamos sucesso falso ou apenas logamos
    console.log("Tentativa de atualizar status, mas coluna não existe no DB.");
    res.json({ message: "Status atualizado (simulado)." });
};