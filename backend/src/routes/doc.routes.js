import { Router } from 'express';
// Vamos importar as funções individualmente para evitar o erro do "undefined"
import { 
  getDocuments, 
  getReceivedDocuments, 
  uploadDocument, 
  downloadDocument, 
  markMonthAsConcluded, 
  markConclusoTec 
} from '../controllers/doc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 

const router = Router();

// Listar documentos
router.get('/my', protect, getDocuments);

// Listar documentos recebidos
router.get('/received', protect, getReceivedDocuments);

// Upload de documento
router.post('/upload', protect, upload.single('file'), uploadDocument);

// Descarregar documento
router.get('/download/:id', protect, downloadDocument);

// Marcar mês/ano como concluído (Atenção: o nome no controller é markMonthAsConcluded)
router.post('/conclude', protect, markMonthAsConcluded);

// Marcar mês/ano inteiro como CONCLUSO TEC
router.post('/mark-tec', protect, markConclusoTec);

export default router;