import { Router } from 'express';
import { updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Rota para atualizar perfil
router.put('/:id', verifyToken, updateUser);

export default router;