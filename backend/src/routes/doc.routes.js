import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
    getDocuments, 
    downloadDocument, 
    updateDocumentStatus 
} from '../controllers/doc.controller.js';

const router = Router();

router.use(protect);

// 1. Rota de Listagem (IMPORTANTE: Deve vir antes das rotas com :id)
router.get('/received', getDocuments);
router.get('/', getDocuments);

// 2. Rota de Download (Correção do erro 404 do botão de impressão)
// O Frontend chama: /api/documents/download/4
router.get('/download/:id', downloadDocument);

// 3. Rota de Visualização (Correção do erro 404 do modal de pré-visualização)
// O Frontend chama: /api/documents/4
router.get('/:id', downloadDocument);

// 4. Atualizar Status
router.patch('/:id/status', updateDocumentStatus);

export default router;