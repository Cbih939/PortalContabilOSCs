import express from 'express';
import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig, 
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';

import { auth as authMiddleware, checkRole } from '../middlewares/auth.middleware.js';
import { protect as auth, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/financeiro/stats', authMiddleware, checkRole(['admin', 'financeiro']), getFinanceiroStats);
router.get('/financeiro/oscs', auth, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', auth, checkRole(['admin', 'financeiro']), updateDebtStatus);
router.get('/financeiro/config', auth, checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', auth, checkRole(['admin', 'financeiro']), updateStripeConfig);

export default router;