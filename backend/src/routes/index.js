import express from 'express';

// Importações Padrão
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import oscRoutes from './osc.routes.js';
import contadorRoutes from './contador.routes.js';
import alertRoutes from './alert.routes.js';
import publicFileRoutes from './publicFile.routes.js';
import messageRoutes from './message.routes.js';

// As Nossas Novas Importações
import docRoutes from './doc.routes.js';
import projectRoutes from './project.routes.js';
import diretoriaRoutes from './board.routes.js';

const router = express.Router();

// Rotas Padrão
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/oscs', oscRoutes);
router.use('/contador', contadorRoutes);
router.use('/notices', alertRoutes);
router.use('/public-files', publicFileRoutes);
router.use('/messages', messageRoutes);

// As Nossas Novas Rotas
router.use('/documents', docRoutes);
router.use('/projects', projectRoutes);
router.use('/diretoria', diretoriaRoutes);

export default router;