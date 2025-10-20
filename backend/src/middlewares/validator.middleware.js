// backend/src/middlewares/validator.middleware.js

import { check, validationResult } from 'express-validator';
import { ROLES } from '../utils/constants.js';

/**
 * Middleware: Lida com os resultados da validação do express-validator.
 *
 * Este middleware deve ser colocado *após* o array de regras
 * na definição da rota.
 */
export const validate = (req, res, next) => {
  // 1. Obtém os erros da validação que foram anexados ao 'req'
  const errors = validationResult(req);

  // 2. Verifica se existem erros
  if (errors.isEmpty()) {
    // Sem erros, continua para o controlador
    return next();
  }

  // 3. Formata os erros para uma resposta amigável
  //    (Ex: [{ "email": "Deve ser um email válido." }])
  const extractedErrors = {};
  errors.array().forEach(err => {
    // Evita sobrescrever se houver múltiplos erros para o mesmo campo
    if (!extractedErrors[err.param]) {
      extractedErrors[err.param] = err.msg;
    }
  });

  // 4. Retorna um erro 400 (Bad Request) com os detalhes
  return res.status(400).json({
    message: 'Erro de validação. Verifique os dados enviados.',
    errors: extractedErrors,
  });
};

// --- Conjuntos de Regras de Validação ---
// (Exportamos estes arrays para usar nas rotas)

/**
 * Regras de validação para a rota de Login.
 * (POST /api/auth/login)
 */
export const loginRules = [
  check('email')
    .notEmpty().withMessage('O email é obrigatório.')
    .isEmail().withMessage('Deve ser um endereço de email válido.')
    .normalizeEmail(),
  check('password')
    .notEmpty().withMessage('A senha é obrigatória.'),
];

/**
 * Regras de validação para a criação de um novo Utilizador (Admin/Contador).
 * (POST /api/users)
 */
export const createUserRules = [
  check('name')
    .notEmpty().withMessage('O nome é obrigatório.')
    .trim()
    .escape(), // Converte <, >, & para entidades HTML (previne XSS)
  check('email')
    .notEmpty().withMessage('O email é obrigatório.')
    .isEmail().withMessage('Deve ser um endereço de email válido.')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('A senha deve ter no mínimo 8 caracteres.'),
  check('role')
    .isIn([ROLES.ADMIN, ROLES.CONTADOR])
    .withMessage(`O perfil (role) deve ser '${ROLES.ADMIN}' ou '${ROLES.CONTADOR}'.`),
];

/**
 * Regras de validação para a criação de uma nova OSC.
 * (POST /api/oscs)
 */
export const createOscRules = [
  check('name')
    .notEmpty().withMessage('O nome da OSC é obrigatório.')
    .trim()
    .escape(),
  check('cnpj')
    .notEmpty().withMessage('O CNPJ é obrigatório.')
    .isLength({ min: 14, max: 18 }) // 14 (só números) ou 18 (com máscara)
    .withMessage('O CNPJ é inválido (deve ter entre 14 e 18 caracteres).')
    .trim(),
  check('email')
    .notEmpty().withMessage('O email de login é obrigatório.')
    .isEmail().withMessage('Deve ser um endereço de email de login válido.')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 8 })
    .withMessage('A senha deve ter no mínimo 8 caracteres.'),
  
  // Campos opcionais
  check('responsible')
    .optional({ checkFalsy: true }) // Permite '' ou null
    .trim()
    .escape(),
  check('phone')
    .optional({ checkFalsy: true })
    .trim(),
  check('email_contato') // Email de contacto (diferente do login)
    .optional({ checkFalsy: true })
    .isEmail().withMessage('O email de contacto é inválido.')
    .normalizeEmail(),
];

/**
 * --- Como Usar (Exemplo num ficheiro de rotas) ---
 *
 * import express from 'express';
 * import { login } from '../controllers/auth.controller.js';
 * import {
 * validate,
 * loginRules
 * } from '../middlewares/validator.middleware.js';
 *
 * const router = express.Router();
 *
 * // A rota de login agora:
 * // 1. Executa as 'loginRules' (que anexam erros ao 'req').
 * // 2. Executa o 'validate' (que verifica os erros e responde 400 ou chama 'next()').
 * // 3. Se passar, executa o controlador 'login'.
 * router.post(
 * '/auth/login',
 * loginRules,  // Array de regras
 * validate,    // O "guarda" que verifica
 * login        // O controlador
 * );
 *
 * export default router;
 */