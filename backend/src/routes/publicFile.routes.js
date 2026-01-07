import express from 'express';
import multer from 'multer';
import * as controller from '../controllers/publicFile.controller.js';

// --- CORREÇÃO IMPORTANTE ---
// 1. O nome do arquivo tem ponto: auth.middleware.js
// 2. O nome da função exportada é 'protect'
import { protect } from '../middlewares/auth.middleware.js'; 

import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuração do Multer (Uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/public/';
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

const upload = multer({ storage: storage });

// --- ROTAS ---
// Usamos 'protect' para garantir que apenas quem está logado pode mexer nos arquivos

// Upload (Apenas logado)
router.post('/', protect, upload.single('file'), controller.uploadFile);

// Deletar (Apenas logado)
router.delete('/:id', protect, controller.deleteFile);

// Listar (Apenas logado)
router.get('/', protect, controller.getFiles);

export default router;