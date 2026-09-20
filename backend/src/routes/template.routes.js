import { Router } from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 
import { 
    getTemplates, 
    uploadTemplate, 
    downloadTemplate, 
    deleteTemplate 
} from '../controllers/template.controller.js';

const router = Router();

// Aplica proteção em todas as rotas deste router
router.use(protect);

// Listar (Corrigido: removido o "controller." pois importamos as funções diretamente)
router.get('/', getTemplates);

// Upload
router.post('/', checkRole(['ADMIN', 'CONTADOR']), upload.any(), uploadTemplate);

// Download
router.get('/:id/download', downloadTemplate);

// Excluir
router.delete('/:id', checkRole(['ADMIN', 'CONTADOR']), deleteTemplate);

export default router;