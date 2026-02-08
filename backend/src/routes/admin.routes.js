// src/routes/admin.routes.js
import express from 'express';
import { listOSCsFinanceiro, updateDebtStatus } from '../controllers/financeiro.controller.js';
import { auth, checkRole } from '../middlewares/auth.js';
import { getFinanceiroStats, updateStripeConfig } from '../controllers/financeiro.controller.js';

const router = express.Router();

// A rota final será: GET /api/admin/financeiro/oscs
router.get('/financeiro/oscs', auth, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);

// A rota final será: PATCH /api/admin/financeiro/oscs/:id/status
router.patch('/financeiro/oscs/:id/status', auth, checkRole(['admin', 'financeiro']), updateDebtStatus);

router.get('/financeiro/stats', auth, getFinanceiroStats);
router.post('/financeiro/config', auth, updateStripeConfig);

export default router;