import express from 'express';
import { getStripeConfig, updateStripeConfig } from '../controllers/financeiro.controller.js';
import { auth, checkRole } from '../middlewares/auth.js'; // Seus middlewares de segurança

const router = express.Router();

// Rotas protegidas: apenas admin ou financeiro podem mexer aqui
router.get('/financeiro/config', auth, checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', auth, checkRole(['admin', 'financeiro']), updateStripeConfig);

export default router;