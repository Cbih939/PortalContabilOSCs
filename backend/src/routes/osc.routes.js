import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getMyOSCs, getOSCById } from '../controllers/osc.controller.js';
import * as oscController from '../controllers/osc.controller.js';
import { verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Todas as rotas aqui requerem login
router.use(protect);
// Rota que o Frontend está chamando: /api/oscs/my
router.get('/my', getMyOSCs);
// Rota para detalhes: /api/oscs/:id
router.get('/:id', getOSCById);
// Rota principal para listar OSCs
router.get('/', verifyToken, oscController.getAllOSCs);
// Rota para detalhes de uma OSC
router.get('/:id', verifyToken, oscController.getOSCById);


export default router;