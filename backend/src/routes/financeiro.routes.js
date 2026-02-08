import express from 'express';
import { getStripeConfig, updateStripeConfig } from '../controllers/financeiro.controller.js';
import { auth, checkRole } from '../middlewares/auth.js'; // Seus middlewares de segurança

const router = express.Router();

// Rotas protegidas: apenas admin ou financeiro podem mexer aqui
router.get('/financeiro/oscs', auth, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);
router.patch('/financeiro/oscs/:id/status', auth, checkRole(['admin', 'financeiro']), updateDebtStatus);

export default router;