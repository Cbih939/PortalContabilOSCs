import { Router } from 'express';
import { login, registerOSC, me, completeOnboarding } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { rateLimit } from '../middlewares/rateLimit.middleware.js';
import { uploadRegistration } from '../middlewares/upload.middleware.js';

const router = Router();

// Limite de tentativas de login por IP + e-mail (mitiga força bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyFn: (req) => `login:${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  message: 'Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.',
  resetOnSuccess: true, // só tentativas falhas contam
});

// Limite para cadastros públicos
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, keyFn: (req) => `register:${req.ip}` });

// Rota de Login
router.post('/login', loginLimiter, login);

// Rota de Auto-registro para OSCs
// (multipart: logotipo/ata/estatuto — o front envia FormData; sem o multer o corpo chegava vazio)
router.post('/register-osc', registerLimiter, uploadRegistration, registerOSC);

// Sessão atual (dados frescos do usuário)
router.get('/me', verifyToken, me);

// Rota para validar o token (usada no carregamento da página)
router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Onboarding (primeiro acesso)
router.post('/onboarding/complete', verifyToken, completeOnboarding);

export default router;
