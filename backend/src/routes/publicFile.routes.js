import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as controller from '../controllers/publicFile.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// 1. Configuração do Armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
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

// 2. Definição da variável 'upload' com limite de 50MB para evitar o erro "File too large"
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// --- ROTAS ---

router.get('/', protect, controller.getFiles);

// A variável 'upload' agora está definida acima desta linha
router.post('/', protect, upload.any(), controller.uploadFile);

router.delete('/:id', protect, controller.deleteFile);

export default router;