// backend/src/routes/index.js

import express from 'express';

// Importa os roteadores específicos de cada módulo
import authRoutes from './auth.routes.js';
import userRoutes from './users.routes.js';
import oscRoutes from './oscs.routes.js';
import docRoutes from './docs.routes.js';
import msgRoutes from './msg.routes.js';
import alertRoutes from './alerts.routes.js';
import contadorRoutes from './contador.routes.js';

// Cria o roteador principal do Express
const router = express.Router();

/* --- Agrupa todas as rotas da API sob o prefixo /api --- */

// Rotas de Autenticação (/api/auth)
router.use('/auth', authRoutes);

// Rotas de Utilizadores (/api/users - geralmente para Admin)
router.use('/users', userRoutes);
router.use('/contador', contadorRoutes);

// Rotas de OSCs (/api/oscs)
router.use('/oscs', oscRoutes);

// Rotas de Documentos (/api/documents)
router.use('/documents', docRoutes);

// Rotas de Mensagens (/api/messages)
router.use('/messages', msgRoutes);

// Rotas de Alertas/Avisos (/api/alerts e /api/notices)
router.use('/alerts', alertRoutes);
// (Vamos usar o mesmo router 'alertRoutes' para 'notices',
//  já que o controlador 'alert.controller' tem as funções)
router.use('/notices', alertRoutes);

// Exporta o roteador principal
export default router;

/**
 * --- Como Usar (no 'server.js') ---
 *
 * import express from 'express';
 * import apiRoutes from './src/routes/index.js'; // Importa este ficheiro
 *
 * const app = express();
 *
 * // ... (middlewares: cors, express.json)
 *
 * // Monta todas as rotas da API sob o prefixo '/api'
 * app.use('/api', apiRoutes);
 *
 * // ... (middlewares de erro, app.listen)
 *
 */