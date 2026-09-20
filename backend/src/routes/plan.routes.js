import express from 'express';
import { 
  getPlans, 
  getActivePlan, 
  createPlan, 
  updatePlan, 
  deletePlan, 
  activatePlan 
} from '../controllers/plan.controller.js';
import { protect, adminOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rota pública/protegida genérica para pegar o plano ativo no checkout
router.get('/active', protect, getActivePlan);

// Rotas exclusivas do Administrador
router.get('/', protect, adminOnly, getPlans);
router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.delete('/:id', protect, adminOnly, deletePlan);
router.patch('/:id/activate', protect, adminOnly, activatePlan);

export default router;
