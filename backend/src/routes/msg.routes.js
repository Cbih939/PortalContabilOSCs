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
} from '../controllers/msg.controller.js';
// (Validação - Opcional para mensagens simples)
// import { validate, sendMessageRules } from '../middlewares/validator.middleware.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/messages --- */

// GET /api/messages/my
// Busca o histórico de mensagens da OSC logada.
// Acesso: Apenas OSCs autenticadas.
router.get(
  '/my',
  protect, // 1º: Autenticação
  checkRole([ROLES.OSC]), // 2º: Autorização (OSC)
  getMyMessages // 3º: Controlador
);

// GET /api/messages/:oscId
// Busca o histórico de mensagens de uma OSC específica (para o Contador).
// Acesso: Apenas Contadores autenticados.
router.get(
  '/:oscId', // O ID da OSC vem como parâmetro na URL
  protect, // 1º: Autenticação
  checkRole([ROLES.CONTADOR]), // 2º: Autorização (Contador)
  getMessagesHistory // 3º: Controlador
);

// POST /api/messages
// Envia uma nova mensagem (pode ser OSC ou Contador).
// Acesso: OSCs ou Contadores autenticados.
router.post(
  '/',
  protect, // 1º: Autenticação (precisa saber quem envia)
  checkRole([ROLES.OSC, ROLES.CONTADOR]), // 2º: Autorização (Só OSC ou Contador)
  // (Opcional: Adicionar regras de validação para 'text' e 'toOscId')
  // sendMessageRules,
  // validate,
  sendMessage // 3º: Controlador (verifica permissões internas)
);

// Exporta o router
export default router;