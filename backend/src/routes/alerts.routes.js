// backend/src/routes/alert.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getMyAlerts,
  createAlert, // Usado para POST /alerts e POST /notices
  markAsRead,
  getSentNoticesHistory // Controlador para o histórico
} from '../controllers/alert.controller.js';
// (Validação pode ser adicionada aqui no futuro)
// import { validate, createAlertRules } from '../middlewares/validator.middleware.js';

// Cria o router
const router = express.Router();

/* --- Rotas para /api/alerts (Principalmente para OSC) --- */

// GET /api/alerts
// Busca os alertas da OSC logada.
router.get(
  '/',
  protect,
  checkRole([ROLES.OSC]),
  getMyAlerts
);

// PATCH /api/alerts/:alertId/read
// Marca um alerta específico como lido (feito pela OSC).
router.patch(
  '/:alertId/read',
  protect,
  checkRole([ROLES.OSC]),
  markAsRead
);

// POST /api/alerts
// Cria um novo alerta de alta prioridade (enviado por um Contador para uma OSC).
router.post(
  '/',
  protect,
  checkRole([ROLES.CONTADOR]),
  // createAlertRules, // Adicionar validação se necessário
  // validate,
  createAlert // Controlador para criar alerta/aviso
);


/* --- Rotas para /api/notices (Principalmente para Contador) --- */
// (Usando o mesmo router e controlador de /alerts por simplicidade)

// POST /api/notices
// Cria um novo aviso geral (enviado por um Contador para uma ou todas as OSCs).
router.post(
  '/', // Note: a rota é POST /api/notices
  protect,
  checkRole([ROLES.CONTADOR]),
  // createAlertRules, // Usar as mesmas regras ou regras específicas
  // validate,
  createAlert // Reutiliza o controlador createAlert
);

// GET /api/notices/history
// Busca o histórico de avisos enviados pelo Contador logado.
router.get(
    '/history', // Rota completa será /api/notices/history
    protect,
    checkRole([ROLES.CONTADOR]),
    getSentNoticesHistory // Chama o controlador do histórico
);

// Exporta o router para ser usado no 'routes/index.js'
export default router;