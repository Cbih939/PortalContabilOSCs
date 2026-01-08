import { Router } from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { getDashboardStats, getMyOSCs } from '../controllers/contador.controller.js';

const router = Router();

// Middleware: Todas as rotas abaixo requerem login e role de Contador ou Admin
router.use(protect);
router.use(checkRole(['Contador', 'Adm']));

router.get('/dashboard-stats', getDashboardStats);
router.get('/my-oscs', getMyOSCs);

export default router;