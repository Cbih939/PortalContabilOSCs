import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/alert.controller.js'; // Importe o controller real

const router = Router();
router.use(protect);

// Altera as rotas "falsas" pelas funções do controlador existente
router.get('/', controller.getMyAlerts); 
router.get('/history', controller.getSentNoticesHistory);
router.post('/', controller.createAlert);
router.patch('/:alertId/read', controller.markAsRead);

export default router;