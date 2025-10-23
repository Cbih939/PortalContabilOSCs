// backend/src/routes/contador.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores (Criaremos a seguir)
import {
  getDashboardStats,
  getRecentActivity,
} from '../controllers/contador.controller.js';

// Cria o router
const router = express.Router();

/* --- Middleware de Proteção para TODAS as rotas do contador --- */
// Garante que o utilizador está logado E tem o perfil de Contador
router.use(protect, checkRole([ROLES.CONTADOR]));

/* --- Definição das Rotas para /api/contador --- */

// GET /api/contador/dashboard/stats
// Busca as estatísticas para o dashboard do contador logado.
router.get('/dashboard/stats', getDashboardStats);

// GET /api/contador/dashboard/activity
// Busca as atividades recentes para o dashboard do contador logado.
router.get('/dashboard/activity', getRecentActivity);

// (Outras rotas específicas do contador podem ser adicionadas aqui no futuro)

// Exporta o router
export default router;