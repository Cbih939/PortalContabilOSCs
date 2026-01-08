import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Listar Documentos
export const getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`[Docs] Listando para User ID: ${userId}`);

    const query = `
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
      ORDER BY d.created_at DESC
    `;
    
    // Simplifiquei a query de teste para garantir que retorna tudo
    // (Filtros são importantes, mas vamos ver os dados primeiro)
    const [rows] = await pool.execute(query);

    // Mapeamento "Universal" - Envia TODAS as chaves possíveis
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        
        // Variações de NOME
        name: doc.original_name,           // React costuma usar este
        title: doc.original_name,          // Backend antigo usava este
        fileName: doc.original_name,       // Outra variação comum
        original_name: doc.original_name,  // Nome original do banco

        // Variações de OSC
        osc: doc.osc_name,                 // React costuma usar este
        oscName: doc.osc_name,             // Backend antigo usava este
        organization: doc.osc_name,

        // Variações de DATA
        date: doc.created_at,              // React costuma usar este
        createdAt: doc.created_at,         // Backend padrão
        timestamp: doc.created_at,

        // Outros
        status: doc.status || 'Pendente',
        type: doc.mime_type || 'application/pdf',
        size: doc.file_size_bytes || 0
    }));

    console.log(`[Docs] Enviando ${safeDocs.length} documentos (Modo Universal).`);
    // Debug: Mostra o primeiro item para conferirmos as chaves no log
    if (safeDocs.length > 0) console.log('[Docs] Exemplo de item:', safeDocs[0]);

    res.json(safeDocs);

  } catch (error) {
    console.error('[Docs] Erro:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// Download E Visualização
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Download] Iniciando para ID: ${id}`);
    
    const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [id]);

    if (rows.length === 0) {
      console.error(`[Download] ID ${id} não encontrado no banco.`);
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    const { saved_filename, original_name, mime_type } = rows[0];
    const filePath = path.join(__dirname, '../../uploads', saved_filename);

    console.log(`[Download] Buscando arquivo físico: ${filePath}`);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mime_type || 'application/octet-stream');
      // Importante: Aspas no nome do arquivo para lidar com espaços
      res.setHeader('Content-Disposition', `attachment; filename="${original_name}"`);
      res.download(filePath, original_name);
    } else {
      console.error(`[Download] ERRO FATAL: Arquivo não existe no disco: ${filePath}`);
      res.status(404).json({ message: 'Arquivo físico não encontrado no servidor.' });
    }
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ message: 'Erro interno no download.' });
  }
};

export const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar.' });
    }
};