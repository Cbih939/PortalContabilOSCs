import { Router } from 'express';
import { updateUser } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Rota de exemplo para perfil
router.get('/profile', protect, (req, res) => {
    res.json({ message: "Perfil do utilizador", user: req.user });
});
router.put('/:id', authMiddleware, updateUser);

export default router;