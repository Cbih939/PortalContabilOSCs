import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../../uploads/public'); // Usando a pasta public para o Nginx
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

// Middleware específico para o formulário de Registro
export const uploadRegistration = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).fields([
    { name: 'logotipo', maxCount: 1 },
    { name: 'ata', maxCount: 1 },
    { name: 'estatuto', maxCount: 1 }
]);