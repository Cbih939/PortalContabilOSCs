import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as controller from '../controllers/publicFile.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Configuração do Multer (Armazenamento em disco)
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

// --- ROTAS (api/public-files) ---

// Listar arquivos (GET /api/public-files)
router.get('/', protect, controller.getFiles);

// Upload de arquivos (POST /api/public-files)
router.post('/', protect, upload.any(), controller.uploadFile);

// Eliminar arquivo (DELETE /api/public-files/:id)
router.delete('/:id', protect, controller.deleteFile);

export default router;