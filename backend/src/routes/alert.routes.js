import { Router } from 'express';
import * as controller from '../controllers/alert.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// IMPORTANTE: Use o nome da função que corrigimos acima
router.get('/', protect, controller.getMyAlerts);
router.post('/', protect, controller.createAlert);
router.patch('/:alertId/read', protect, controller.markAsRead);
router.get('/history', protect, controller.getSentNoticesHistory);

export default router;