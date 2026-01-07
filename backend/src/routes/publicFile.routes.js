import express from 'express';
import multer from 'multer';
import * as controller from '../controllers/publicFile.controller.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
// Configuração simples do Multer (ajuste o destino conforme sua estrutura)
const upload = multer({ dest: 'uploads/public/' }); 

// Apenas Admin pode fazer upload/delete
router.post('/', authMiddleware, upload.single('file'), controller.uploadFile);
router.delete('/:id', authMiddleware, controller.deleteFile);

// Todos (OSC e Admin) podem listar
router.get('/', authMiddleware, controller.getFiles);

export default router;