import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as controller from '../controllers/publicFile.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Configuração do Multer com Caminho Absoluto
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Usando caminho absoluto para evitar erro de diretório não encontrado na VPS
    const uploadPath = '/var/www/PortalContabilOSCs/backend/uploads/public/';
    
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
});

// --- ROTAS ---

// Listar arquivos
router.get('/', protect, controller.getFiles);

// Upload de arquivos - Alterado para .any() para capturar o arquivo independente do nome da chave
router.post('/', protect, upload.any(), controller.uploadFile);

// Eliminar arquivo
router.delete('/:id', protect, controller.deleteFile);

export default router;