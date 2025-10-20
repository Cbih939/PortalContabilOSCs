// backend/src/routes/oscs.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { validate, createOscRules } from '../middlewares/validator.middleware.js'; // Importa regras específicas
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getAllOSCs,
  getMyOSCs,
  getOSCById,
  createOSC,
  updateOSC,
  assignContador,
  deleteOSC,
} from '../controllers/osc.controller.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/oscs --- */

// GET /api/oscs
// Busca todas as OSCs (com nome do contador).
// Acesso: Apenas Admin.
router.get(
  '/',
  protect, // 1º: Autenticação
  checkRole([ROLES.ADMIN]), // 2º: Autorização (Admin)
  getAllOSCs // 3º: Controlador
);

// GET /api/oscs/my
// Busca as OSCs associadas ao Contador logado.
// Acesso: Apenas Contador.
router.get(
  '/my',
  protect, // 1º: Autenticação
  checkRole([ROLES.CONTADOR]), // 2º: Autorização (Contador)
  getMyOSCs // 3º: Controlador
);

// GET /api/oscs/:id
// Busca detalhes de uma OSC específica.
// Acesso: Admin, Contador associado ou a própria OSC.
router.get(
  '/:id',
  protect, // 1º: Autenticação (precisa saber quem está a pedir)
  // A verificação de permissão específica (se é associado/próprio)
  // é feita DENTRO do controlador getOSCById.
  getOSCById // 2º: Controlador
);

// POST /api/oscs
// Cria uma nova OSC (e um utilizador associado).
// Acesso: Admin ou Contador.
router.post(
  '/',
  protect, // 1º: Autenticação
  checkRole([ROLES.ADMIN, ROLES.CONTADOR]), // 2º: Autorização
  createOscRules, // 3º: Regras de validação
  validate,       // 4º: Middleware que verifica a validação
  createOSC       // 5º: Controlador
);

// PUT /api/oscs/:id
// Atualiza os dados de uma OSC.
// Acesso: Contador associado ou a própria OSC.
router.put(
  '/:id',
  protect, // 1º: Autenticação
  checkRole([ROLES.CONTADOR, ROLES.OSC]), // 2º: Autorização (Contador ou OSC)
  // (Poderia adicionar regras de validação para update aqui)
  updateOSC // 3º: Controlador (verifica permissão interna)
);

// PATCH /api/oscs/:id/assign
// Associa/Reassocia uma OSC a um Contador.
// Acesso: Apenas Admin.
router.patch(
  '/:id/assign',
  protect, // 1º: Autenticação
  checkRole([ROLES.ADMIN]), // 2º: Autorização (Admin)
  // (Poderia adicionar validação para 'contadorId' no body)
  assignContador // 3º: Controlador
);

// DELETE /api/oscs/:id
// Apaga uma OSC (e o utilizador associado).
// Acesso: Apenas Admin.
router.delete(
  '/:id',
  protect, // 1º: Autenticação
  checkRole([ROLES.ADMIN]), // 2º: Autorização (Admin)
  deleteOSC // 3º: Controlador
);

// Exporta o router
export default router;