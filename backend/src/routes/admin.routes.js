import express from 'express';
// Middlewares de segurança conforme o seu padrão
import { protect, checkRole } from '../middlewares/auth.middleware.js';

// Importação dos Controllers
import { 
    listOSCsFinanceiro, 
    updateDebtStatus, 
    getFinanceiroStats, 
    getStripeConfig,      // Centralizado aqui
    updateStripeConfig 
} from '../controllers/financeiro.controller.js';

import { getHistoricoPagamentos } from '../controllers/historico.controller.js';

const router = express.Router();

/**
 * ROTAS DO MÓDULO FINANCEIRO
 * Acesso permitido para: 'admin' e 'financeiro'
 */

// Estatísticas do Dashboard Financeiro (Total de OSCs, Inadimplentes, etc)
router.get('/financeiro/stats', protect, checkRole(['admin', 'financeiro']), getFinanceiroStats);

// Listagem de todas as OSCs com status de débito
router.get('/financeiro/oscs', protect, checkRole(['admin', 'financeiro']), listOSCsFinanceiro);

// Atualização manual do status de inadimplência (Botão Bloquear/Liberar)
router.patch('/financeiro/oscs/:id/status', protect, checkRole(['admin', 'financeiro']), updateDebtStatus);

// Configurações Dinâmicas do Stripe (Chaves de API e IDs de Preço)
router.get('/financeiro/config', protect, checkRole(['admin', 'financeiro']), getStripeConfig);
router.post('/financeiro/config', protect, checkRole(['admin', 'financeiro']), updateStripeConfig);

// Histórico Geral de Pagamentos e Transações
router.get('/financeiro/historico', protect, checkRole(['admin', 'financeiro']), getHistoricoPagamentos);

export default router;