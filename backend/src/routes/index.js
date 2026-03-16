import express from 'express';

// Importação das rotas (NOMES PADRONIZADOS NO SINGULAR)
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';      // Certifique-se que o arquivo é user.routes.js
import oscRoutes from './osc.routes.js';        // Certifique-se que o arquivo é osc.routes.js
import contadorRoutes from './contador.routes.js';
import alertRoutes from './alert.routes.js';
import messageRoutes from './msg.routes.js';
import publicFileRoutes from './publicFile.routes.js';
import messageRoutes from './message.routes.js';
import boardRoutes from './board.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/oscs', oscRoutes);
router.use('/contador', contadorRoutes);
router.use('/notices', alertRoutes);
router.use('/messages', messageRoutes);
router.use('/public-files', publicFileRoutes);
router.use('/board', boardRoutes);

export default router;