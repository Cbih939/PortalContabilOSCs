import { Router } from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { getDashboardStats, getMyOSCs } from '../controllers/contador.controller.js';

const router = Router();

// Aplica proteção a todas as rotas abaixo
router.use(protect);
router.use(checkRole(['Contador', 'Adm'])); 

router.get('/dashboard-stats', getDashboardStats);
router.get('/my-oscs', getMyOSCs);

export default router;