import { Router } from 'express';
import * as controller from '../controllers/doc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 

const router = Router();

// Listar documentos (OSC vê os dela, Contador vê das OSCs dele)
// CORREÇÃO: Mudei de controller.getMyDocuments para controller.getDocuments
router.get('/my', protect, controller.getDocuments);

// Listar documentos recebidos (Para o painel central do Contador)
router.get('/received', protect, controller.getReceivedDocuments);

// Upload de documento (OSC e Contador)
router.post('/upload', protect, upload.single('file'), controller.uploadDocument);

// Descarregar documento
router.get('/download/:id', protect, controller.downloadDocument);

// Marcar mês/ano como concluído
router.post('/conclude', protect, controller.markAsConcluded);

// NOVO: Marcar mês/ano inteiro como CONCLUSO TEC
router.post('/mark-tec', protect, controller.markConclusoTec);

export default router;