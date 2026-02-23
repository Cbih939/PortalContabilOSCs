import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../../uploads/public');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Exportação 1: Genérica (O que o doc.routes.js está procurando)
export const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } 
});

// Exportação 2: Específica para o Registro de OSC (com múltiplos campos)
export const uploadRegistration = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([
    { name: 'logotipo', maxCount: 1 },
    { name: 'ata', maxCount: 1 },
    { name: 'estatuto', maxCount: 1 }
]);