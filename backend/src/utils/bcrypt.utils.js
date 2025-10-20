// backend/src/utils/bcrypt.utils.js

import bcrypt from 'bcryptjs';

// Define o número de "rondas" de salting. Um valor maior é mais seguro,
// mas também mais lento. 10 é um bom equilíbrio atualmente.
const SALT_ROUNDS = 10;

/**
 * Gera um hash seguro para uma senha em texto plano.
 *
 * @param {string} plainTextPassword A senha a ser hashada.
 * @returns {Promise<string>} O hash da senha.
 * @throws {Error} Se ocorrer um erro durante o hashing.
 */
export const hashPassword = async (plainTextPassword) => {
  try {
    // 1. Gera um "salt" aleatório
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    // 2. Cria o hash da senha usando o salt
    const hash = await bcrypt.hash(plainTextPassword, salt);
    return hash;
  } catch (error) {
    console.error('[Bcrypt] Erro ao gerar hash da senha:', error);
    throw new Error('Erro ao processar a senha.');
  }
};

/**
 * Compara uma senha em texto plano com um hash existente.
 *
 * @param {string} plainTextPassword A senha fornecida pelo utilizador (ex: no login).
 * @param {string} hashFromDatabase O hash da senha armazenado no banco de dados.
 * @returns {Promise<boolean>} True se as senhas corresponderem, false caso contrário.
 * @throws {Error} Se ocorrer um erro durante a comparação.
 */
export const comparePassword = async (plainTextPassword, hashFromDatabase) => {
  try {
    // A função 'compare' do bcrypt extrai automaticamente o salt
    // do 'hashFromDatabase' e faz a comparação segura.
    const isMatch = await bcrypt.compare(plainTextPassword, hashFromDatabase);
    return isMatch;
  } catch (error) {
    console.error('[Bcrypt] Erro ao comparar senhas:', error);
    // É importante lançar um erro aqui também, para não dar
    // falsos negativos em caso de falha interna do bcrypt.
    throw new Error('Erro ao verificar a senha.');
  }
};

/**
 * --- Como Usar ---
 *
 * // Na criação de um utilizador (user.controller.js ou osc.controller.js)
 * import { hashPassword } from './utils/bcrypt.utils.js';
 * const plainPassword = req.body.password;
 * const passwordHash = await hashPassword(plainPassword);
 * // ... (salvar o 'passwordHash' no banco)
 *
 * // No login (auth.controller.js)
 * import { comparePassword } from './utils/bcrypt.utils.js';
 * const user = await UserModel.findUserByEmail(req.body.email);
 * const plainPassword = req.body.password;
 * const hashFromDb = user.password_hash;
 * const isMatch = await comparePassword(plainPassword, hashFromDb);
 * if (isMatch) {
 * // Login válido
 * } else {
 * // Senha incorreta
 * }
 */