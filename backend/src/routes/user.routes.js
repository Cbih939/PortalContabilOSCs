import { Router } from 'express';
import { updateUser } from '../controllers/user.controller.js';
// Importamos o objeto inteiro para evitar erros de exportação nomeada
import * as authController from '../controllers/auth.controller.js'; 

const router = Router();

// Utilizamos a função de verificação que existe no seu ficheiro
router.put('/:id', authController.verifyToken, updateUser);

export default router;