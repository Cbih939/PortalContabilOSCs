import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as controller from '../controllers/publicFile.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } 
});

// GET: Listagem
router.get('/', protect, controller.getFiles);

// POST: Upload de múltiplos campos (file e cover)
// Usamos .any() para flexibilidade ou .fields() para maior rigor
router.post('/', upload.any(), uploadFile);

// DELETE: Remover
router.delete('/:id', protect, controller.deleteFile);

export default router;