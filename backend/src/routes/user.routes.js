import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Rota que está a dar erro 404 - Listar todos os utilizadores
router.get('/', verifyToken, userController.getAllUsers);

// Rota de atualização que já corrigimos anteriormente
router.put('/:id', verifyToken, userController.updateUser);

// Rota para buscar um utilizador específico
router.get('/:id', verifyToken, userController.getUserById);

export default router;