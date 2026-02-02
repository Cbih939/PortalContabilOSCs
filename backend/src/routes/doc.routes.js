import { Router } from 'express';
import * as controller from '../controllers/doc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 

const router = Router();

// Listar documentos (OSC vê os dela, Contador vê das OSCs dele)
router.get('/my', protect, controller.getDocuments); 

// Documentos recebidos para o carrossel do Contador
router.get('/received', protect, controller.getReceivedDocuments);

// ROTA DE UPLOAD: Note o uso de upload.single('file') 
// Certifique-se que no Frontend o FormData usa o nome 'file'
router.post('/upload', protect, upload.single('file'), controller.uploadDocument); 

// ROTA DE CONCLUSÃO: Estava faltando esta linha para o botão do contador funcionar
router.post('/conclude', protect, controller.markMonthAsConcluded);

// Download e Status
router.get('/download/:id', protect, controller.downloadDocument);
router.patch('/:id/status', protect, controller.updateDocumentStatus);

export default router;