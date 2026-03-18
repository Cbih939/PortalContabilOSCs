import { Router } from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { 
    getDashboardStats, 
    getMyOSCs,
    getSystemReports, 
    getRecentActivity 
} from '../controllers/contador.controller.js';

const router = Router();

router.use(protect);
// Use os nomes EXATOS que estão no seu ENUM do banco de dados (geralmente minúsculos)
router.use(checkRole(['contador', 'admin', 'Contador', 'Adm'])); 

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activity', getRecentActivity);
router.get('/my-oscs', getMyOSCs);
router.get('/reports', protect, getSystemReports);

export default router;