import { Router } from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { 
    getDashboardStats, 
    getMyOSCs, 
    getRecentActivity 
} from '../controllers/contador.controller.js';

const router = Router();

// Middleware de proteção
router.use(protect);
router.use(checkRole(['Contador', 'Adm']));

// CORREÇÃO: Ajuste das URLs para bater com o Frontend
// Antes: /dashboard-stats -> Agora: /dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// Nova rota adicionada para corrigir o erro 404 da activity
router.get('/dashboard/activity', getRecentActivity);

router.get('/my-oscs', getMyOSCs);

export default router;