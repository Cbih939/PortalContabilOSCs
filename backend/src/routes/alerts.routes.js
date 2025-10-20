// backend/src/routes/alerts.routes.js

import express from 'express';
// Importa os middlewares de autenticação/autorização
import { protect, checkRole } from '../middlewares/auth.middleware.js';
// Importa as constantes de ROLES
import { ROLES } from '../utils/constants.js';
// Importa os controladores de alerta
import {
  getMyAlerts,
  createAlert,
  markAsRead,
} from '../controllers/alert.controller.js';

// Cria o router do Express
const router = express.Router();

/* --- Definição das Rotas para /api/alerts --- */

// GET /api/alerts
// Busca os alertas da OSC logada.
// Acesso: Apenas OSCs autenticadas.
router.get(
  '/',
  protect, // 1º: Verifica se está autenticado
  checkRole([ROLES.OSC]), // 2º: Verifica se é uma OSC
  getMyAlerts // 3º: Executa o controlador
);

// POST /api/alerts
// Cria um novo alerta (enviado por um Contador para uma OSC).
// Acesso: Apenas Contadores autenticados.
router.post(
  '/',
  protect, // 1º: Autenticação
  checkRole([ROLES.CONTADOR]), // 2º: Autorização (Contador)
  // (Validação do corpo da requisição seria adicionada aqui no futuro)
  // validator.createAlertRules,
  // validator.validate,
  createAlert // 3º: Controlador
);

// PATCH /api/alerts/:alertId/read
// Marca um alerta específico como lido (feito pela OSC).
// Acesso: Apenas OSCs autenticadas.
router.patch(
  '/:alertId/read',
  protect, // 1º: Autenticação
  checkRole([ROLES.OSC]), // 2º: Autorização (OSC)
  markAsRead // 3º: Controlador
);

// Exporta o router para ser usado no 'routes/index.js'
export default router;