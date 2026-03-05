import { Router } from 'express';
import * as controller from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createOSC, getMyOSCs, getAllOSCs, updateOSC } from '../controllers/osc.controller.js'; // Ajuste conforme os seus imports

const router = Router();

router.post('/', createOSC);

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