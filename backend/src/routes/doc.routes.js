import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 
import { 
    getDocuments, 
    downloadDocument, 
    updateDocumentStatus,
    uploadDocument // Adicione esta importação (vamos criar no controller)
} from '../controllers/doc.controller.js';

const router = Router();
router.use(protect);

router.get('/my', getDocuments); 
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/received', getDocuments);
router.get('/', getDocuments);
router.get('/download/:id', downloadDocument);
router.get('/:id', downloadDocument);
router.patch('/:id/status', updateDocumentStatus);

export default router;