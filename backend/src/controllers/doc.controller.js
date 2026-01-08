import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar Documentos (Recebidos ou Enviados)
export const getDocuments = async (req, res) => {
  try {
    const { oscId, status } = req.query;
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

    // 1. Filtros de Segurança
    if (userRole === 'Contador') {
      conditions.push('o.assigned_contador_id = ?');
      params.push(userId);
    } else if (userRole === 'OSC') {
      conditions.push('d.osc_id = (SELECT id FROM oscs WHERE user_id = ? LIMIT 1)');
      params.push(userId);
    }

    // 2. Filtros de Interface
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

    // --- CORREÇÃO CRUCIAL AQUI ---
    // Mapeamos os nomes do banco para os nomes que o Documents.jsx espera
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        
        // Frontend espera 'name', Backend tinha 'title'/'original_name'
        name: doc.original_name || 'Sem Nome', 
        
        // Frontend espera 'original_name' no handler de download
        original_name: doc.original_name, 

        // Frontend espera 'osc', Backend tinha 'oscName'
        osc: doc.osc_name || 'Sem Nome', 
        
        // Frontend espera 'date' para ordenar, Backend tinha 'createdAt'
        date: doc.created_at, 
        
        status: doc.status || 'Pendente',
        type: doc.mime_type || 'application/octet-stream',
        size: doc.file_size_bytes || 0
    }));

    console.log(`[Docs] Enviando ${safeDocs.length} documentos formatados para o React.`);
    res.json(safeDocs);

  } catch (error) {
    console.error('[Docs] Erro ao listar:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// Upload (Placeholder)
export const uploadDocument = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};

// Download de Documento
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca o nome do arquivo salvo no disco
    const [rows] = await pool.execute('SELECT saved_filename, original_name FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado no banco.' });
    }

    const { saved_filename, original_name } = rows[0];
    
    // Caminho absoluto para a pasta uploads
    const filePath = path.join(__dirname, '../../uploads', saved_filename);

    console.log(`[Download] Tentando baixar: ${filePath}`);

    if (fs.existsSync(filePath)) {
      // Força o download com o nome original
      res.download(filePath, original_name);
    } else {
      console.error(`[Download] ARQUIVO NÃO EXISTE NO DISCO: ${filePath}`);
      // Se não achar o arquivo físico, criamos um dummy apenas para não travar o teste
      // (Em produção, isso seria um erro 404 real)
      res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ message: 'Erro ao baixar arquivo.' });
  }
};

// Atualizar Status
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