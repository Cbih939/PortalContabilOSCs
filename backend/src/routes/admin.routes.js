import express from 'express';
// Importamos as funções específicas que o seu ficheiro exporta
import { protect, checkRole } from '../middlewares/auth.middleware.js';

import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig, 
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';

const router = express.Router();

// Usamos 'protect' em vez de 'auth' conforme o seu middleware
router.get('/financeiro/stats', protect, checkRole(['admin', 'financeiro']), getFinanceiroStats);
router.get('/financeiro/oscs', protect, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', protect, checkRole(['admin', 'financeiro']), updateDebtStatus);
router.get('/financeiro/config', protect, checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', protect, checkRole(['admin', 'financeiro']), updateStripeConfig);

export default router;