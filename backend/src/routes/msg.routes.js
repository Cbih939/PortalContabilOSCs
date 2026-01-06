// backend/src/routes/msg.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getMyMessages,
  getMessagesHistory,
  sendMessage,
  getChatContacts, // Importando a nova função
} from '../controllers/msg.controller.js';

const router = express.Router();

/* --- Definição das Rotas para /api/messages --- */

// GET /api/messages/my
// Busca o histórico de mensagens da OSC logada.
router.get(
  '/my',
  protect,
  checkRole([ROLES.OSC]),
  getMyMessages
);

// --- IMPORTANTE: Esta rota deve vir ANTES de /:oscId ---
// GET /api/messages/contacts
// Busca a lista de contatos para o sidebar do Contador
router.get(
  '/contacts',
  protect,
  checkRole([ROLES.CONTADOR]),
  getChatContacts
);
// -----------------------------------------------------

// GET /api/messages/:oscId
// Busca o histórico de mensagens de uma OSC específica (para o Contador).
router.get(
  '/:oscId', 
  protect,
  checkRole([ROLES.CONTADOR]),
  getMessagesHistory
);

// POST /api/messages
// Envia uma nova mensagem
router.post(
  '/',
  protect,
  checkRole([ROLES.OSC, ROLES.CONTADOR]),
  sendMessage
);

export default router;