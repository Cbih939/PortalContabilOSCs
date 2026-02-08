import express from 'express';
import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig, 
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';
import { auth, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Dashboard e Stats
router.get('/financeiro/stats', auth, checkRole(['admin', 'financeiro']), getFinanceiroStats);

// Gestão de OSCs
router.get('/financeiro/oscs', auth, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', auth, checkRole(['admin', 'financeiro']), updateDebtStatus);

// Configurações do Stripe
router.get('/financeiro/config', auth, checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', auth, checkRole(['admin', 'financeiro']), updateStripeConfig);

export default router;