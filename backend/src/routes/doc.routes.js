import { Router } from 'express';
import { 
  getDocuments, 
  getReceivedDocuments, 
  uploadDocument, 
  downloadDocument, 
  markMonthAsConcluded, 
  markConclusoTec,
  markMonthAsPending,
  deleteDocument
} from '../controllers/doc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 

const router = Router();

router.get('/my', protect, getDocuments);
router.get('/received', protect, getReceivedDocuments);
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/download/:id', protect, downloadDocument);

// Marcar como Concluído
router.post('/conclude', protect, markMonthAsConcluded);
// NOVO: Marcar como Pendente (Desfazer)
router.post('/pending', protect, markMonthAsPending);

// Marcar TEC
router.post('/mark-tec', protect, markConclusoTec);

// NOVO: Excluir Documento
router.delete('/:id', protect, deleteDocument);

export default router;