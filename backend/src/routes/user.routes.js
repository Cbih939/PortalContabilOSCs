import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Usamos verifyToken que é o nome original da função no seu ficheiro
router.put('/:id', authController.verifyToken, userController.updateUser);

export default router;