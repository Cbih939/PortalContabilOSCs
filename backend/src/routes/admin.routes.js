import express from 'express';
// Importamos tudo do middleware para um objeto chamado 'm'
import * as m from '../middlewares/auth.middleware.js';

import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig, 
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';

const router = express.Router();

// Agora usamos m.auth ou m.protect (o Node nos dirá qual é)
// Tente m.auth primeiro, se falhar, tente m.protect
router.get('/financeiro/stats', m.auth, m.checkRole(['admin', 'financeiro']), getFinanceiroStats);
router.get('/financeiro/oscs', m.auth, m.checkRole(['admin', 'financeiro']), listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', m.auth, m.checkRole(['admin', 'financeiro']), updateDebtStatus);
router.get('/financeiro/config', m.auth, m.checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', m.auth, m.checkRole(['admin', 'financeiro']), updateStripeConfig);

export default router;