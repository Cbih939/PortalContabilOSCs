import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de onde salvar os arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Salva na pasta uploads na raiz do backend
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Cria um nome único: nome-original-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de arquivos (Opcional, aceita tudo por enquanto)
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});