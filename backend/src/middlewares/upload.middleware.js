import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/public/';
        // Garante que a pasta existe para evitar erro de diretório não encontrado
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * EXPORTAÇÃO 1: Genérica (Single File)
 * Utilizada por doc.routes.js e outras rotas de documentos padrão.
 */
export const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB para documentos gerais
});

/**
 * EXPORTAÇÃO 2: Registro de OSC (Multi-fields)
 * Utilizada especificamente na rota de auto-registro para capturar múltiplos ficheiros.
 */
export const uploadRegistration = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB por ficheiro no registro
}).fields([
    { name: 'logotipo', maxCount: 1 },
    { name: 'ata', maxCount: 1 },
    { name: 'estatuto', maxCount: 1 }
]);