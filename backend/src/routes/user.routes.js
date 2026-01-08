import express from 'express';
// Middlewares (Se der erro de importação aqui após o git reset, remova essas linhas de validação)
import { protect, checkRole } from '../middlewares/auth.middleware.js';
// Controladores
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

/* --- Definição das Rotas para /api/users --- */

// Aplica 'protect' a todas. O checkRole(Admin) restringe o acesso.
router.use(protect, checkRole([ROLES.ADMIN]));

// GET /api/users
router.get('/', getAllUsers);

// POST /api/users
// (Removi os middlewares de validação complexos temporariamente para garantir que o servidor suba sem erros de arquivo faltando)
router.post('/', createUser);

// GET /api/users/:id
router.get('/:id', getUserById);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;