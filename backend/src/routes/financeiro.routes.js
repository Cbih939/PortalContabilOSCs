// backend/src/routes/financeiro.routes.js
//
// Substitui as antigas rotas /api/admin/financeiro/* (perfil FINANCEIRO descontinuado).
//   ADMIN e ADM Contador: painel, débitos e histórico (com escopo por escritório)
//   ADMIN apenas: configuração do Stripe
import express from 'express';
import { protect, checkRole, requireAdminOrOfficeAdmin } from '../middlewares/auth.middleware.js';
import {
  getFinanceiroStats, listOSCsFinanceiro, updateDebtStatus,
  getHistoricoPagamentos, getStripeConfig, updateStripeConfig,
} from '../controllers/financeiro.controller.js';

const router = express.Router();

router.use(protect);

router.get('/stats', requireAdminOrOfficeAdmin, getFinanceiroStats);
router.get('/oscs', requireAdminOrOfficeAdmin, listOSCsFinanceiro);
router.patch('/oscs/:id/status', requireAdminOrOfficeAdmin, updateDebtStatus);
router.get('/historico', requireAdminOrOfficeAdmin, getHistoricoPagamentos);

// Chaves do Stripe são da plataforma: somente o Administrador.
router.get('/config', checkRole('ADMIN'), getStripeConfig);
router.post('/config', checkRole('ADMIN'), updateStripeConfig);

export default router;
