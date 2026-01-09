import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
    getDocuments, 
    downloadDocument, 
    updateDocumentStatus 
} from '../controllers/doc.controller.js';

const router = Router();
router.use(protect);

// Adicione este apelido '/my' para que o frontend encontre a rota
router.get('/my', getDocuments); 

router.get('/received', getDocuments);
router.get('/', getDocuments);
router.get('/download/:id', downloadDocument);
router.get('/:id', downloadDocument);
router.patch('/:id/status', updateDocumentStatus);

export default router;