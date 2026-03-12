import { Router } from 'express';
import { 
  createOSC, 
  getMyOSCs, 
  getAllOSCs, 
  updateOSC, 
  getOSCById, 
  getMyPayments, 
  assignContador,
  transferOSCOffice // <--- IMPORTAMOS A NOVA FUNÇÃO AQUI
} from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', createOSC);

// Listagem e detalhes
router.get('/', protect, getAllOSCs);
router.get('/my', protect, getMyOSCs);

// Pagamentos
router.get('/financeiro/meus-pagamentos', protect, getMyPayments);

router.get('/:id', protect, getOSCById);

// ROTA DE ATUALIZAÇÃO
router.put('/:id', protect, updateOSC);

// Associação (PATCH)
router.patch('/:id/assign', protect, assignContador);

// ROTA DE TRANSFERÊNCIA DE ESCRITÓRIO (REGRA 1)
router.put('/:id/transfer', protect, transferOSCOffice); // <--- NOVA ROTA AQUI

export default router;