// backend/src/routes/osc.routes.js

import { Router } from 'express';
import { 
  createOSC, 
  getMyOSCs, 
  getAllOSCs, 
  updateOSC, 
  getOSCById, 
  getMyPayments, 
  assignContador,
  transferOSCOffice,
  getMyOscProfile // <--- IMPORTAMOS A NOVA FUNÇÃO DO PERFIL AQUI
} from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', createOSC);

// Listagem e detalhes
router.get('/', protect, getAllOSCs);
router.get('/my', protect, getMyOSCs);

// Pagamentos
router.get('/financeiro/meus-pagamentos', protect, getMyPayments);

// ROTA DO PERFIL DA OSC LOGADA (Importante: Tem de vir ANTES do /:id)
router.get('/me', protect, getMyOscProfile);

// Busca por ID genérico
router.get('/:id', protect, getOSCById);

// ROTA DE ATUALIZAÇÃO
router.put('/:id', protect, updateOSC);

// Associação (PATCH)
router.patch('/:id/assign', protect, assignContador);

// ROTA DE TRANSFERÊNCIA DE ESCRITÓRIO (REGRA 1)
router.put('/:id/transfer', protect, transferOSCOffice); 

export default router;