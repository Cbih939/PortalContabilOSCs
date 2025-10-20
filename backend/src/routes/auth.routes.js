// backend/src/routes/auth.routes.js

import express from 'express';
// Importa os controladores de autenticação
import { login, getMe } from '../controllers/auth.controller.js';
// Importa o middleware de proteção (verifica token)
import { protect } from '../middlewares/auth.middleware.js';
// Importa as regras de validação e o middleware validador
import { validate, loginRules } from '../middlewares/validator.middleware.js';

// Cria o router do Express
const router = express.Router();

/* --- Definição das Rotas para /api/auth --- */

// POST /api/auth/login
// Rota pública para autenticar um utilizador.
// Aplica regras de validação antes de chamar o controlador.
router.post(
  '/login',
  loginRules, // 1º: Define as regras (ex: email obrigatório)
  validate,   // 2º: Verifica os resultados das regras
  login       // 3º: Se a validação passar, executa o controlador
);

// GET /api/auth/me
// Rota protegida para obter os dados do utilizador logado.
// Requer um token JWT válido no cabeçalho Authorization.
router.get(
  '/me',
  protect, // 1º: Verifica se o token JWT é válido e anexa 'req.user'
  getMe    // 2º: Executa o controlador para buscar os dados do utilizador
);

// (Poderia adicionar aqui a rota POST /api/auth/logout se fosse necessária)

// Exporta o router para ser usado no 'routes/index.js'
export default router;