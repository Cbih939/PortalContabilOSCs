import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Middleware de proteção para todas as rotas deste ficheiro
router.use(verifyToken);

// Listar todos (Onde dava erro)
router.get('/', userController.getAllUsers);

// CRIAR NOVO (Faltava no seu ficheiro anterior!)
router.post('/', userController.createUser);

// Buscar específico
router.get('/:id', userController.getUserById);

// Atualizar
router.put('/:id', userController.updateUser);

// Eliminar
router.delete('/:id', userController.deleteUser);

export default router;