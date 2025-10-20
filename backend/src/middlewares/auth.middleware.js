// backend/src/middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import config from '../config/index.js'; // Onde está o nosso JWT_SECRET
import * as UserModel from '../models/user.model.js'; // (Opcional, mas bom para revalidar)

/**
 * Middleware: Proteger Rotas (Verificar Autenticação)
 *
 * Verifica se um token JWT válido está presente no cabeçalho
 * 'Authorization'. Se estiver, decodifica o 'payload' e
 * anexa-o a 'req.user'.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Procurar o token no cabeçalho 'Authorization: Bearer <token>'
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 2. Extrair o token (remove o "Bearer ")
      token = authHeader.split(' ')[1];

      // 3. Verificar e Decodificar o token
      //    Isto verifica a assinatura e a data de expiração
      const decoded = jwt.verify(token, config.JWT_SECRET);

      // 4. Anexar o 'payload' do utilizador ao 'req'
      //    O 'payload' é o que definimos no auth.controller.js
      //    (ex: { id: 1, role: 'Adm', name: 'Admin' })
      req.user = decoded;

      // 5. (Opcional, mas mais seguro) Verificar se o utilizador ainda existe
      //    Isto previne que um token válido de um utilizador apagado funcione.
      //    const userExists = await UserModel.findUserById(decoded.id);
      //    if (!userExists || userExists.status === 'Inativo') {
      //      return res.status(401).json({ message: 'Não autorizado, utilizador inativo ou não encontrado.' });
      //    }

      // 6. Tudo certo, passa para o próximo middleware ou controlador
      next();
    } catch (error) {
      // Se 'jwt.verify' falhar (token expirado, assinatura inválida)
      console.error('Erro de autenticação (token):', error.message);
      return res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  // 7. Se não encontrou 'Authorization' ou 'Bearer'
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, nenhum token fornecido.' });
  }
};

/**
 * Middleware: Verificar Perfil (Verificar Autorização)
 *
 * Este é um "middleware factory" (uma função que retorna um middleware).
 * Deve ser usado *APÓS* o middleware 'protect'.
 *
 * @param {Array<string>} allowedRoles - Array de perfis permitidos (ex: [ROLES.ADMIN, ROLES.CONTADOR])
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // 1. 'req.user' já deve existir (graças ao 'protect')
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Não autorizado (utilizador não identificado).' });
    }

    // 2. Verifica se o 'role' do utilizador está no array de 'allowedRoles'
    const isAllowed = allowedRoles.includes(req.user.role);

    if (!isAllowed) {
      // 3. O utilizador está autenticado, mas não tem permissão
      return res.status(403).json({ message: 'Acesso negado (Forbidden). O seu perfil não tem permissão.' });
    }

    // 4. Utilizador autenticado E autorizado.
    next();
  };
};

/**
 * --- Como Usar (Exemplo num ficheiro de rotas) ---
 *
 * import express from 'express';
 * import { protect, checkRole } from '../middlewares/auth.middleware.js';
 * import { ROLES } from '../utils/constants.js';
 * import { getAllUsers } from '../controllers/user.controller.js';
 * import { getMyAlerts } from '../controllers/alert.controller.js';
 *
 * const router = express.Router();
 *
 * // Rota 1: Protegida para QUALQUER utilizador autenticado
 * // (Ex: A rota 'getMe' ou 'getMyAlerts')
 * // Primeiro executa 'protect', depois 'getMyAlerts'
 * router.get('/alerts/my', protect, getMyAlerts);
 *
 * // Rota 2: Protegida APENAS para Admins
 * // Primeiro 'protect', depois 'checkRole', depois 'getAllUsers'
 * router.get(
 * '/users',
 * protect,
 * checkRole([ROLES.ADMIN]), // Passa o array de perfis
 * getAllUsers
 * );
 *
 * export default router;
 */