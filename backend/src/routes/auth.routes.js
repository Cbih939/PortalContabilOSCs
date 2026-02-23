import { Router } from 'express';
// Importação única e limpa do controller
import { login, registerOSC, verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Define as rotas usando as funções importadas
router.post('/login', login);
router.post('/register-osc', registerOSC);

// Rota de verificação do token
router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

export default router;