import express from 'express';
import { getSystemStatus, toggleMaintenance } from '../controllers/system.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js'; // Ajuste o caminho se necessário

const router = express.Router();

// Rota aberta para o frontend verificar o status a qualquer momento
router.get('/status', getSystemStatus);

// Rota protegida: Apenas o ADMIN pode ligar/desligar a manutenção
router.post('/toggle-maintenance', protect, checkRole(['admin']), toggleMaintenance);

export default router;