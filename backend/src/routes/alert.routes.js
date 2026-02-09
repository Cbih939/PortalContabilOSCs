import { Router } from 'express';
import * as controller from '../controllers/alert.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// 1. Busca alertas (corrigido para o nome da função no seu controller)
router.get('/', protect, controller.getMyAlerts);

// 2. Cria alerta
router.post('/', protect, controller.createAlert);

// 3. Marca como lido (PATCH /api/alerts/:alertId/read)
router.patch('/:alertId/read', protect, controller.markAsRead);

// 4. Histórico de avisos enviados (GET /api/alerts/history)
router.get('/history', protect, controller.getSentNoticesHistory);

export default router;