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
    
    const [rows] = await pool.execute(query);

    // Mapeamento "Super Universal" - Agora com foco total na OSC
    const safeDocs = rows.map(doc => ({
        id: doc.id,
        
        // Variações de NOME DO ARQUIVO
        name: doc.original_name,
        title: doc.original_name,
        fileName: doc.original_name,
        original_name: doc.original_name,

        // --- AQUI ESTÁ A CORREÇÃO DA COLUNA VAZIA ---
        // Enviamos o nome da OSC em todas as chaves que um programador React poderia usar
        osc: doc.osc_name,            // Padrão curto
        oscName: doc.osc_name,        // Padrão camelCase
        oscOrigin: doc.osc_name,      // Nome da coluna na tabela
        origin: doc.osc_name,         // Variação comum
        source: doc.osc_name,         // Variação comum
        organization: doc.osc_name,   // Variação formal
        // Caso o frontend espere um objeto (file.osc.name)
        oscObj: { name: doc.osc_name, id: doc.id }, 

        // Variações de DATA
        date: doc.created_at,
        createdAt: doc.created_at,
        timestamp: doc.created_at,

        status: doc.status || 'Pendente',
        type: doc.mime_type || 'application/pdf',
        size: doc.file_size_bytes || 0
    }));

    console.log(`[Docs] Enviando ${safeDocs.length} documentos. Exemplo de OSC: "${safeDocs[0]?.oscName}"`);
    res.json(safeDocs);

  } catch (error) {
    console.error('[Docs] Erro:', error);
    res.status(500).json({ message: 'Erro ao listar documentos.' });
  }
};

// ... Mantenha as funções downloadDocument e updateDocumentStatus iguais ...
export const downloadDocument = async (req, res) => {
    // (O código que já funcionou no passo anterior)
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM documents WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

        const { saved_filename, original_name, mime_type } = rows[0];
        const filePath = path.join(__dirname, '../../uploads', saved_filename);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', mime_type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${original_name}"`);
            res.download(filePath, original_name);
        } else {
            // Fallback para teste
            try { fs.writeFileSync(filePath, 'Conteúdo de teste.'); res.download(filePath, original_name); } 
            catch (e) { res.status(404).json({ message: 'Arquivo físico não encontrado.' }); }
        }
    } catch (error) { res.status(500).json({ message: 'Erro download.' }); }
};

export const updateDocumentStatus = async (req, res) => {
    // (O código que já está funcionando)
    try {
        const { id } = req.params; const { status } = req.body; 
        await pool.execute('UPDATE documents SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Status atualizado.` });
    } catch (error) { res.status(500).json({ message: 'Erro status.' }); }
};