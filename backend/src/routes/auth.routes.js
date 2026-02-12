import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { login, registerOSC } from '../controllers/auth.controller.js';
import { uploadRegistration } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/register-osc', uploadRegistration, registerOSC);

router.post('/login', login);

router.get('/verify', verifyToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});



export default router;