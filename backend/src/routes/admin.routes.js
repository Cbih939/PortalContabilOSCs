import express from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import * as messageController from '../controllers/message.controller.js';
import * as profileController from '../controllers/profile.controller.js';
import { getDashboardStats } from '../controllers/admin.controller.js';

const router = express.Router();

// Todas as rotas abaixo exigem login e perfil ADMIN.
// (As rotas financeiras migraram para /api/financeiro; o perfil FINANCEIRO foi descontinuado.)
router.use(protect);
router.use(checkRole('ADMIN'));

// Dashboard geral
router.get('/dashboard-stats', getDashboardStats);

// Perfil
router.put('/profile/password', profileController.updatePassword);

// Mensagens de cobrança
router.get('/messages/:status', messageController.getMessagesByStatus);
router.post('/messages/send', messageController.sendMessage);

export default router;
