import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMyOSCs, getOSCById } from '../controllers/osc.controller.js';

const router = Router();

// Todas as rotas aqui requerem login
router.use(protect);

// Rota que o Frontend está chamando: /api/oscs/my
router.get('/my', getMyOSCs);

// Rota para detalhes: /api/oscs/:id
router.get('/:id', getOSCById);

export default router;