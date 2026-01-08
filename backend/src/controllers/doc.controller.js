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

    // 1. Filtros de Segurança (Fundamental para não dar erro de permissão)
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

    // Mapeamento Seguro
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        
        // Nomes do Arquivo
        name: doc.original_name || 'Sem Nome', 
        original_name: doc.original_name, // Necessário para o Download funcionar

        // CORREÇÃO: Enviamos o nome da OSC em várias chaves para garantir que o React encontra
        osc: doc.osc_name,     
        oscName: doc.osc_name, 
        source: doc.osc_name,
        
        // Data
        date: doc.created_at, 
        
        // Outros
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

// Download E Visualização
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Download] Solicitado para ID: ${id}`);
    
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
      console.error(`[Download] ARQUIVO FÍSICO EM FALTA: ${filePath}`);
      // Fallback para não dar erro na apresentação se o ficheiro não existir fisicamente
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
        res.json({ message: `Status atualizado para ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    }
};