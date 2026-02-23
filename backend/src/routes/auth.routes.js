import { Router } from 'express';
import { login, registerOSC, verifyToken } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register-osc', registerOSC);

router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;