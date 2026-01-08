import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
// CORREÇÃO: Importar do middleware correto
import { verifyToken } from '../middlewares/auth.middleware.js'; 

const router = Router();

router.post('/login', login);

router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

export default router;