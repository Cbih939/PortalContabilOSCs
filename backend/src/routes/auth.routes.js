import express from 'express';
import { login, verifyToken } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', protect, verifyToken);

export default router;