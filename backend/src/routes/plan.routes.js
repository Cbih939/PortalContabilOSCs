import express from 'express';
import { 
  getPlans, 
  getActivePlan, 
  createPlan, 
  updatePlan, 
  deletePlan, 
  activatePlan 
} from '../controllers/plan.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rota pública/protegida genérica para pegar o plano ativo no checkout
router.get('/active', protect, getActivePlan);

// Rotas exclusivas do Administrador
router.get('/', protect, checkRole('ADMIN'), getPlans);
router.post('/', protect, checkRole('ADMIN'), createPlan);
router.put('/:id', protect, checkRole('ADMIN'), updatePlan);
router.delete('/:id', protect, checkRole('ADMIN'), deletePlan);
router.patch('/:id/activate', protect, checkRole('ADMIN'), activatePlan);

export default router;
