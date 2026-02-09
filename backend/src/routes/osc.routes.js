import { Router } from 'express';
import * as controller from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Listagem e detalhes
router.get('/', protect, controller.getAllOSCs);
router.get('/my', protect, controller.getMyOSCs);

// CORREÇÃO: Adicionado o prefixo 'controller.' para encontrar a função
router.get('/financeiro/meus-pagamentos', protect, controller.getMyPayments);

router.get('/:id', protect, controller.getOSCById);

// ROTA DE ATUALIZAÇÃO
router.put('/:id', protect, controller.updateOSC);

// Associação (PATCH)
router.patch('/:id/assign', protect, controller.assignContador);

export default router;