import express from 'express';
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import * as messageController from '../controllers/message.controller.js';
import * as profileController from '../controllers/admin/profile.controller.js';

// Centralizamos todas as importações do financeiro em um único controller
import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig, 
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';

import { getHistoricoPagamentos } from '../controllers/historico.controller.js';

const router = express.Router();

// Todas as rotas abaixo exigem login e permissão de admin ou financeiro
router.use(protect);
router.use(checkRole(['admin', 'financeiro']));

router.put('/profile/password', profileController.updatePassword);
router.get('/financeiro/stats', getFinanceiroStats);
router.get('/financeiro/oscs', listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', updateDebtStatus);
router.get('/financeiro/config', getStripeConfig);
router.post('/financeiro/config', updateStripeConfig);
router.get('/financeiro/historico', getHistoricoPagamentos);
router.get('/messages/:status', messageController.getMessagesByStatus);
router.post('/messages/send', messageController.sendMessage);

export default router;