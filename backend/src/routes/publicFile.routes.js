import express from 'express';
import multer from 'multer';
import path from 'path';
// Verifique se o caminho do controller está correto
import { getFiles, uploadFile, deleteFile, serveFile } from '../controllers/publicFile.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { fileFilter } from '../middlewares/upload.middleware.js';

const router = express.Router();

// --- CONFIGURAÇÃO DO MULTER (Direto aqui para evitar erros de importação) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define a pasta de destino. 
    // Se no seu servidor for apenas 'uploads/', mude aqui.
    // Baseado nos seus logs anteriores, parece ser 'uploads/public/'
    cb(null, 'uploads/public/'); 
  },
  filename: function (req, file, cb) {
    // Gera um nome único para não sobrescrever arquivos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Inicializa o upload sem limites restritos por enquanto
const upload = multer({ 
    storage: storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB
});
// --------------------------------------------------------------------------

// Rotas
// Abertura/baixa de arquivos da biblioteca e modelos (link direto, sem cabeçalho de login).
router.get('/:id/:kind(file|cover)', serveFile);

router.get('/', protect, getFiles);

// O segredo: upload.any() aceita qualquer campo (pdf, file, cover, image...)
router.post('/', protect, checkRole('ADMIN'), upload.any(), uploadFile); 

router.delete('/:id', protect, checkRole('ADMIN'), deleteFile);

export default router;