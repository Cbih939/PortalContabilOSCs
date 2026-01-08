import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; // Importa o Multer
import { 
    getTemplates, 
    uploadTemplate, 
    downloadTemplate, 
    deleteTemplate 
} from '../controllers/template.controller.js';

const router = Router();

router.use(protect); // Todas exigem login

// Listar
router.get('/', getTemplates);

// Upload (Note o upload.single('file') -> 'file' é o nome do campo no formulário do React)
router.post('/', upload.single('file'), uploadTemplate);

// Download
router.get('/:id/download', downloadTemplate);

// Excluir
router.delete('/:id', deleteTemplate);

export default router;