import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 
import { 
    getDocuments, 
    downloadDocument, 
    updateDocumentStatus,
    uploadDocument 
} from '../controllers/doc.controller.js';

const router = Router();

// Define /my para coincidir com o Frontend e evitar o erro 404
router.get('/my', protect, getDocuments); 

// Define /upload para o endpoint de envio
router.post('/upload', protect, upload.single('file'), uploadDocument); 

router.get('/download/:id', protect, downloadDocument);
router.patch('/:id/status', protect, updateDocumentStatus);

export default router;