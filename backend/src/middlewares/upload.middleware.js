import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Somente estes tipos são aceitos (extensão E mimetype declarado).
const ALLOWED_EXTENSIONS = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx',
    '.png', '.jpg', '.jpeg', '.webp', '.txt',
]);

export const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        const error = new Error('Tipo de arquivo não permitido. Envie PDF, Word, Excel, PowerPoint, imagem (JPG/PNG/WEBP), CSV ou TXT.');
        error.code = 'INVALID_FILE_TYPE';
        return cb(error);
    }
    cb(null, true);
};

// 1. STORAGE SEGURO (Para Documentos Contábeis e Governança)
const storageDocs = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve(__dirname, '../../uploads'); // Pasta base e segura
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Mantém o nome original, substituindo apenas espaços/caracteres por "_"
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        // Exemplo: Balanco_2024_1739485000.pdf
        cb(null, `${baseName}_${Date.now()}${ext}`);
    }
});

// 2. STORAGE PÚBLICO (Apenas para auto-registro e Logotipos)
const storagePublic = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.resolve(__dirname, '../../uploads/public'); // Pasta pública
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${baseName}_${Date.now()}${ext}`);
    }
});

/**
 * EXPORTAÇÃO 1: Genérica (Single File)
 * Utilizada por doc.routes.js - Usa a pasta SEGURA e mantém o nome original.
 */
export const upload = multer({ 
    storage: storageDocs,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});

/**
 * EXPORTAÇÃO 2: Registro de OSC (Multi-fields)
 * Utilizada especificamente na rota de auto-registro - Usa a pasta PÚBLICA.
 */
export const uploadRegistration = multer({ 
    storage: storagePublic,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
}).fields([
    { name: 'logotipo', maxCount: 1 },
    { name: 'ata', maxCount: 1 },
    { name: 'estatuto', maxCount: 1 }
]);