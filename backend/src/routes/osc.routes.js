import express from 'express';
// Importa as funções do controlador
import { getAllOSCs, getOSCById, createOSC, updateOSC, deleteOSC, assignContador, getMyOSCs } from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Rota Minhas OSCs (Deve vir antes do :id)
router.get('/my', getMyOSCs);

// Rotas Padrão
router.get('/', getAllOSCs);
router.post('/', createOSC);
router.get('/:id', getOSCById);
router.put('/:id', updateOSC);
router.delete('/:id', deleteOSC);

// Rota de Associação
router.post('/:id/assign', assignContador);

export default router;