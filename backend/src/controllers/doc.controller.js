import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar Documentos (Recebidos ou Enviados)
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status, type } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`[Docs] Buscando documentos para User: ${userId} (${userRole})`);

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

    // 1. Filtros de Segurança (Quem pode ver o quê)
    if (userRole === 'Contador') {
      // Contador vê documentos das OSCs vinculadas a ele
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else if (userRole === 'OSC') {
      // OSC vê apenas seus próprios documentos
      conditions.push('d.osc_id = (SELECT id FROM oscs WHERE user_id = ? LIMIT 1)');
      params.push(userId);
    }

    // 2. Filtros de Interface (Query Params)
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

    // 3. Blindagem de Dados (Para o Frontend não quebrar)
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        title: doc.original_name || 'Documento sem nome',
        oscName: doc.osc_name || 'Sem nome',
        type: doc.mime_type || 'application/octet-stream',
        createdAt: doc.created_at,
        status: doc.status || 'Pendente',
        size: doc.file_size_bytes || 0,
        hasFile: !!doc.saved_filename
    }));

    console.log(`[Docs] Enviando ${safeDocs.length} documentos.`);
    res.json(safeDocs);

  } catch (error) {
    console.error('[Docs] Erro ao listar:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// Upload de Documento
export const uploadDocument = async (req, res) => {
    // Implementaremos se necessário para o contador, 
    // mas o foco agora é listar o que ele recebeu.
    res.status(501).json({ message: 'Not implemented yet' });
};

// Download de Documento
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    // Verifica se o documento existe
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado no banco.' });
    }

    const { saved_filename, original_name } = rows[0];
    const filePath = path.join(__dirname, '../../uploads', saved_filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, original_name);
    } else {
      console.error(`[Download] Arquivo físico não encontrado: ${filePath}`);
      res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo.' });
  }
};

// Atualizar Status (Aprovar/Rejeitar)
export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado para ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};