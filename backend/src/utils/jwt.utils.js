// backend/src/utils/jwt.utils.js

import jwt from 'jsonwebtoken';
import config from '../config/index.js'; // Importa as configurações (JWT_SECRET, JWT_EXPIRES_IN)

/**
 * Gera um token JWT assinado para um payload de utilizador.
 *
 * @param {object} payload O objeto contendo os dados a serem incluídos no token
 * (ex: { id: 1, role: 'Adm', name: 'Admin' }).
 * NUNCA inclua dados sensíveis como senhas aqui.
 * @returns {string} O token JWT assinado.
 * @throws {Error} Se ocorrer um erro durante a assinatura.
 */
export const generateToken = (payload) => {
  try {
    // Usa a função 'sign' do jsonwebtoken:
    // 1º argumento: O payload (dados a serem embutidos).
    // 2º argumento: O segredo (JWT_SECRET) para assinar o token.
    // 3º argumento: Opções, como o tempo de expiração ('expiresIn').
    const token = jwt.sign(
      payload,
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRES_IN, // Ex: '7d', '1h', '30m'
      }
    );
    return token;
  } catch (error) {
    console.error('[JWT] Erro ao gerar token:', error);
    throw new Error('Erro ao gerar token de autenticação.');
  }
};

/**
 * Verifica a validade de um token JWT e retorna o seu payload.
 *
 * NOTA: O middleware 'protect' (auth.middleware.js) já faz esta verificação
 * para proteger as rotas. Esta função é mais útil para cenários específicos
 * onde você possa precisar verificar um token manualmente fora do fluxo normal
 * de middlewares.
 *
 * @param {string} token O token JWT a ser verificado.
 * @returns {object | null} O payload decodificado se o token for válido, ou null/lança erro se inválido.
 * @throws {Error | jwt.JsonWebTokenError | jwt.TokenExpiredError} Se o token for inválido ou expirar.
 */
export const verifyToken = (token) => {
  try {
    // Usa a função 'verify' do jsonwebtoken:
    // 1º argumento: O token a ser verificado.
    // 2º argumento: O segredo (JWT_SECRET) usado para assiná-lo.
    // Ela verifica a assinatura e a expiração. Se algo estiver errado, lança um erro.
    const decodedPayload = jwt.verify(token, config.JWT_SECRET);
    return decodedPayload;
  } catch (error) {
    // O erro pode ser 'JsonWebTokenError' (assinatura inválida)
    // ou 'TokenExpiredError' (token expirado).
    console.error('[JWT] Erro ao verificar token:', error.message);
    // Re-lança o erro para quem chamou poder tratá-lo.
    throw error;
  }
};

/**
 * --- Como Usar ---
 *
 * // Na geração do token (auth.controller.js -> login)
 * import { generateToken } from './utils/jwt.utils.js';
 * const payload = { id: user.id, role: user.role, name: user.name };
 * const token = generateToken(payload);
 * res.json({ token });
 *
 * // Na verificação do token (auth.middleware.js -> protect)
 * import jwt from 'jsonwebtoken'; // O middleware usa diretamente
 * import config from '../config/index.js';
 * // ...
 * try {
 * const decoded = jwt.verify(token, config.JWT_SECRET);
 * req.user = decoded;
 * next();
 * } catch (error) {
 * res.status(401).json({ message: 'Token inválido.' });
 * }
 * // ...
 */