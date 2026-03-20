import express from 'express';
import { getSystemLogs } from '../controllers/log.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apenas Contador e Admin podem ver a caixa preta do sistema
router.get('/', protect, checkRole(['contador', 'admin']), getSystemLogs);

export default router;