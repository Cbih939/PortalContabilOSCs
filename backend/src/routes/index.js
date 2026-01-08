import express from 'express';

// Importação das rotas
// Atenção: Certifique-se que os arquivos na pasta 'src/routes' tenham EXATAMENTE estes nomes:
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';      // Deve ser 'user.routes.js'
import oscRoutes from './osc.routes.js';        // Deve ser 'osc.routes.js'
import contadorRoutes from './contador.routes.js';
import alertRoutes from './alert.routes.js';
import messageRoutes from './msg.routes.js';
import publicFileRoutes from './publicFile.routes.js';

const router = express.Router();

// Definição dos Endpoints
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/oscs', oscRoutes);
router.use('/contador', contadorRoutes);
router.use('/notices', alertRoutes);    // Frontend chama /notices
router.use('/messages', messageRoutes);
router.use('/public-files', publicFileRoutes);

export default router;