import { Router } from 'express';
import { login, registerOSC, verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Rota de Login
router.post('/login', login);

// Rota de Auto-registro para OSCs
router.post('/register-osc', registerOSC);

// Rota para validar o token (usada no carregamento da página)
router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

export default router;