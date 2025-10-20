// backend/src/models/user.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca todos os utilizadores, com filtros opcionais.
 * @param {object} filters - Opcional. Ex: { role: 'Contador', name: 'Carlos' }
 * @returns {Promise<Array>} Lista de utilizadores (sem password_hash).
 */
export const findAll = async (filters = {}) => {
  let query = 'SELECT id, name, email, role, status, created_at FROM users WHERE 1=1'; // 1=1 para facilitar adicionar filtros
  const params = [];

  if (filters.role) {
    query += ' AND role = ?';
    params.push(filters.role);
  }
  if (filters.name) {
    query += ' AND name LIKE ?';
    params.push(`%${filters.name}%`); // Busca parcial com LIKE
  }
  // (Pode adicionar mais filtros aqui: status, email, etc.)
  
  query += ' ORDER BY name ASC';

  const [rows] = await pool.execute(query, params);
  return rows;
};

/**
 * Busca um utilizador pelo seu ID.
 * @param {number} id - O ID do utilizador.
 * @returns {Promise<object | null>} O utilizador (com password_hash) ou null.
 */
export const findUserById = async (id) => {
  // Inclui password_hash aqui porque o 'auth.middleware' pode precisar revalidar
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

/**
 * Busca um utilizador pelo seu Email.
 * @param {string} email - O email do utilizador.
 * @returns {Promise<object | null>} O utilizador (com password_hash) ou null.
 */
export const findUserByEmail = async (email) => {
  // Inclui password_hash para o processo de login
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

/**
 * Cria um novo utilizador (Admin ou Contador).
 * (Para OSCs, use 'osc.model.js -> createOscAndUser')
 * @param {object} userData - { name, email, password_hash, role }
 * @returns {Promise<object>} O novo utilizador criado (sem password_hash).
 */
export const createUser = async (userData) => {
  const { name, email, password_hash, role } = userData;
  const query = `
    INSERT INTO users (name, email, password_hash, role, status) 
    VALUES (?, ?, ?, ?, 'Ativo')
  `;
  const [result] = await pool.execute(query, [
    name,
    email,
    password_hash,
    role
  ]);

  // Busca o utilizador recém-criado para retornar (sem a senha)
  const newUser = await findUserById(result.insertId);
  // eslint-disable-next-line no-unused-vars
  const { password_hash: removedHash, ...safeUser } = newUser;
  return safeUser;
};

/**
 * Atualiza os dados de um utilizador.
 * @param {number} id - O ID do utilizador a ser atualizado.
 * @param {object} updateData - { name, email, role, status }
 * @returns {Promise<object | null>} O utilizador atualizado (sem password_hash) ou null.
 */
export const updateUser = async (id, updateData) => {
  const { name, email, role, status } = updateData;

  // Constrói a query dinamicamente para atualizar apenas os campos fornecidos
  const fieldsToUpdate = [];
  const params = [];
  
  if (name !== undefined) {
    fieldsToUpdate.push('name = ?');
    params.push(name);
  }
  if (email !== undefined) {
    fieldsToUpdate.push('email = ?');
    params.push(email);
  }
  if (role !== undefined) {
    fieldsToUpdate.push('role = ?');
    params.push(role);
  }
  if (status !== undefined) {
    fieldsToUpdate.push('status = ?');
    params.push(status);
  }
  
  if (fieldsToUpdate.length === 0) {
    // Nada a atualizar
    return await findUserById(id); // Retorna o utilizador original
  }

  params.push(id); // Adiciona o ID ao final para o WHERE

  const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  
  const [result] = await pool.execute(query, params);

  if (result.affectedRows === 0) {
    return null; // Utilizador não encontrado
  }

  // Busca o utilizador atualizado para retornar (sem a senha)
  const updatedUser = await findUserById(id);
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safeUser } = updatedUser;
  return safeUser;
};

/**
 * Apaga um utilizador.
 * (CUIDADO: Se for OSC, deve ser apagado via 'osc.model.js -> deleteOscAndUser'
 * para garantir a transação e apagar o registo em 'oscs' também)
 * @param {number} id - O ID do utilizador a ser apagado.
 * @returns {Promise<boolean>} True se foi apagado, false se não encontrado.
 */
export const deleteUser = async (id) => {
  // Adiciona uma verificação para não apagar OSCs por aqui (segurança)
  const user = await findUserById(id);
  if (!user) return false;
  if (user.role === ROLES.OSC) {
    console.warn(`Tentativa de apagar utilizador OSC (ID: ${id}) via user.model. Use osc.model.`);
    // Poderia lançar um erro aqui, mas retornar 'false' é mais seguro
    return false; 
  }

  const [result] = await pool.execute(
    'DELETE FROM users WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};