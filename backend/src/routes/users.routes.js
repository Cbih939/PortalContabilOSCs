// backend/src/routes/users.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { validate, createUserRules } from '../middlewares/validator.middleware.js'; // Importa regras específicas
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/users --- */

// Aplica 'protect' e 'checkRole(Admin)' a TODAS as rotas neste ficheiro
router.use(protect, checkRole([ROLES.ADMIN]));

// GET /api/users
// Busca todos os utilizadores (com filtros opcionais via query string).
router.get('/', getAllUsers);

// POST /api/users
// Cria um novo utilizador (Admin ou Contador).
router.post(
  '/',
  createUserRules, // 1º: Regras de validação
  validate,        // 2º: Middleware que verifica a validação
  createUser       // 3º: Controlador
);

// GET /api/users/:id
// Busca um utilizador específico pelo ID.
router.get('/:id', getUserById);

// PUT /api/users/:id
// Atualiza um utilizador existente.
router.put(
  '/:id',
  // (Poderia adicionar regras de validação para update aqui)
  updateUser
);

// DELETE /api/users/:id
// Apaga um utilizador.
router.delete('/:id', deleteUser);

// Exporta o router
export default router;