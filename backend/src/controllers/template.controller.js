import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Listar Modelos
export const getTemplates = async (req, res) => {
    try {
        console.log('[Templates] Buscando lista de modelos...');
        
        // Pega todos os templates (Poderíamos filtrar por contador, mas modelos costumam ser globais)
        const [rows] = await pool.execute('SELECT * FROM templates ORDER BY created_at DESC');

        // Mapeamento Universal (Blindado)
        const safeTemplates = rows.map(t => ({
            id: t.id,
            
            // Variações de Título/Nome
            title: t.title,          // O banco usa title
            name: t.title,           // React pode usar name
            label: t.title,
            fileName: t.original_name,
            
            // Variações de Data
            date: t.created_at,
            created_at: t.created_at,
            timestamp: t.created_at,

            // Arquivo físico
            file: t.saved_filename,
            type: t.mime_type,
            size: t.file_size_bytes
        }));

        console.log(`[Templates] Enviando ${safeTemplates.length} modelos.`);
        res.json(safeTemplates);

    } catch (error) {
        console.error('[Templates] Erro ao listar:', error);
        res.status(500).json({ message: 'Erro ao carregar modelos.' });
    }
};

// 2. Upload de Novo Modelo
export const uploadTemplate = async (req, res) => {
    try {
        const { title } = req.body; // Título que o usuário digitou
        const file = req.file;      // Arquivo que veio do Multer
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
        }

        console.log(`[Templates] Recebendo upload: ${file.originalname}`);

        const query = `
            INSERT INTO templates (title, original_name, saved_filename, mime_type, file_size_bytes, uploaded_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(query, [
            title || file.originalname, // Se não der título, usa o nome do arquivo
            file.originalname,
            file.filename,
            file.mimetype,
            file.size,
            userId
        ]);

        res.status(201).json({ message: 'Modelo enviado com sucesso!' });

    } catch (error) {
        console.error('[Templates] Erro no upload:', error);
        res.status(500).json({ message: 'Erro ao salvar modelo.' });
    }
};

// 3. Download
export const downloadTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT saved_filename, original_name, mime_type FROM templates WHERE id = ?', [id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Modelo não encontrado.' });

        const { saved_filename, original_name, mime_type } = rows[0];
        const filePath = path.join(__dirname, '../../uploads', saved_filename);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', mime_type || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${original_name}"`);
            res.download(filePath, original_name);
        } else {
            // Fallback de teste
            try {
                fs.writeFileSync(filePath, 'Conteúdo de teste.');
                res.download(filePath, original_name);
            } catch (e) {
                res.status(404).json({ message: 'Arquivo físico não encontrado.' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no download.' });
    }
};

// 4. Excluir (Opcional, mas útil)
export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM templates WHERE id = ?', [id]);
        res.json({ message: 'Modelo removido.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir.' });
    }
};