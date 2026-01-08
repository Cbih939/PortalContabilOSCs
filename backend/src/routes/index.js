import express from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js'; // Padronizado para singular
import oscRoutes from './osc.routes.js';
import contadorRoutes from './contador.routes.js';
import alertRoutes from './alert.routes.js';
import messageRoutes from './msg.routes.js';
import publicFileRoutes from './publicFile.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Rota /api/users
router.use('/oscs', oscRoutes);
router.use('/contador', contadorRoutes);
router.use('/notices', alertRoutes); // Corrigido para /notices (como o frontend pede)
router.use('/messages', messageRoutes);
router.use('/public-files', publicFileRoutes);

export default router;