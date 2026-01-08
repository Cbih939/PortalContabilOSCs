import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
    getDocuments, 
    downloadDocument, 
    updateDocumentStatus 
} from '../controllers/doc.controller.js';

const router = Router();

router.use(protect);

// Rota que o Frontend chama para listar (Meus Documentos)
// Mapeamos '/received' para a função genérica getDocuments que já filtra pelo usuário
router.get('/received', getDocuments);

// Rota genérica de listagem (caso usada em outro lugar)
router.get('/', getDocuments);

// Download
router.get('/:id/download', downloadDocument);

// Atualizar Status
router.patch('/:id/status', updateDocumentStatus);

export default router;