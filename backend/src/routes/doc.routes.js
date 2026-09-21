import { Router } from 'express';
import { 
  getDocuments, 
  getReceivedDocuments,
  getReceivedByOsc, 
  getDocumentStats,
  uploadDocument, 
  downloadDocument, 
  markMonthAsConcluded, 
  markConclusoTec,
  markMonthAsPending,
  deleteDocument,
  downloadMonthZip,
  generatePublicLink,
  downloadPublicDocument
} from '../controllers/doc.controller.js';
import { protect, blockIfInDebt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 

const router = Router();

// ROTA PÚBLICA (link compartilhado, protegido por token assinado)
router.get('/public/:token', downloadPublicDocument);

// Todas as demais exigem login. OSC em débito é bloqueada também no servidor.
router.get('/my', protect, blockIfInDebt, getDocuments);
router.get('/received', protect, getReceivedDocuments);
router.get('/received-by-osc', protect, getReceivedByOsc);
router.get('/stats', protect, blockIfInDebt, getDocumentStats);
router.post('/upload', protect, blockIfInDebt, upload.single('file'), uploadDocument);
router.get('/download/:id', protect, blockIfInDebt, downloadDocument);
router.get('/download-month-zip', protect, blockIfInDebt, downloadMonthZip);

// Gerar link de partilha
router.post('/share/:id', protect, blockIfInDebt, generatePublicLink);

// Marcar como Concluído / Pendente (Desfazer) / TEC — somente equipe contábil (validado no controller)
router.post('/conclude', protect, markMonthAsConcluded);
router.post('/pending', protect, markMonthAsPending);
router.post('/mark-tec', protect, markConclusoTec);

// Excluir Documento (acesso validado no controller)
router.delete('/:id', protect, blockIfInDebt, deleteDocument);

export default router;
