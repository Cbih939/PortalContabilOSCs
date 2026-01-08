import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// Exemplo de rota protegida
router.get('/profile', protect, (req, res) => {
    res.json({ message: "Perfil do usuário", user: req.user });
});

// Se houver funções no controller, adicione aqui:
// router.get('/', protect, userController.getAllUsers);

export default router;