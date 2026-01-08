import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
// CORREÇÃO: Importar verifyToken do middleware correto
import { verifyToken } from '../middlewares/auth.middleware.js'; 

const router = Router();

// Rota de Login
router.post('/login', login);

// Rota de Verificação (opcional, para persistência de sessão)
router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

export default router;