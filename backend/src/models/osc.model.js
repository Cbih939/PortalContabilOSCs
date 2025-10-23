// backend/src/models/osc.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca todas as OSCs com o nome do contador associado.
 * (Usado pelo Admin)
 * @returns {Promise<Array>} Lista de OSCs.
 */
export const findAllWithContador = async () => {
  const query = `
    SELECT
      o.id,
      u_osc.name, -- Busca o nome da tabela users associada à OSC
      o.cnpj,
      o.responsible,
      u_osc.status, -- Busca o status da tabela users associada à OSC
      u_contador.name as contadorName -- Busca o nome do contador (se houver)
    FROM oscs o
    JOIN users u_osc ON o.id = u_osc.id -- JOIN para obter nome e status da OSC
    LEFT JOIN users u_contador ON o.assigned_contador_id = u_contador.id
      AND u_contador.role = '${ROLES.CONTADOR}'
    WHERE u_osc.role = '${ROLES.OSC}' -- Garante que estamos pegando apenas utilizadores OSC
    ORDER BY u_osc.name ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Busca OSCs associadas a um Contador específico.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<Array>} Lista de OSCs (incluindo nome e status da tabela users).
 */
export const findByContadorId = async (contadorId) => {
  const query = `
    SELECT
        o.id,
        u.name, -- Nome da OSC (da tabela users)
        o.cnpj,
        o.responsible,
        o.email,
        o.phone,
        o.address,
        u.status -- Status da OSC (da tabela users)
    FROM oscs o
    JOIN users u ON o.id = u.id -- JOIN para obter nome e status
    WHERE o.assigned_contador_id = ? AND u.role = '${ROLES.OSC}'
    ORDER BY u.name ASC
  `;
  const [rows] = await pool.execute(query, [contadorId]);
  return rows;
};

/**
 * Busca uma OSC pelo seu ID (incluindo dados da tabela users).
 * @param {number} id - O ID da OSC.
 * @returns {Promise<object | null>} A OSC com dados combinados ou null.
 */
export const findById = async (id) => {
  // Faz JOIN para buscar todos os dados relevantes de uma vez
  const query = `
    SELECT
      o.id,
      u.name,
      o.cnpj,
      o.responsible,
      o.email, -- Email de contacto da OSC
      u.email as login_email, -- Email de login (pode ser diferente)
      o.phone,
      o.address,
      u.status,
      o.assigned_contador_id,
      u.role -- Inclui role para verificações
    FROM oscs o
    JOIN users u ON o.id = u.id
    WHERE o.id = ? AND u.role = '${ROLES.OSC}'
  `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

/**
 * Busca uma OSC pelo seu CNPJ (para validação).
 * @param {string} cnpj - O CNPJ da OSC.
 * @returns {Promise<object | null>} A OSC ou null se não encontrada.
 */
export const findByCnpj = async (cnpj) => {
  const [rows] = await pool.execute(
    'SELECT * FROM oscs WHERE cnpj = ?',
    [cnpj]
  );
  return rows[0] || null;
};

/**
 * Cria uma nova OSC e o seu Utilizador associado (usando Transação).
 * @param {object} oscData - Dados da tabela 'oscs' (cnpj, responsible, email, etc.).
 * @param {object} userData - Dados da tabela 'users' (name, email (login), password_hash, role).
 * @returns {Promise<object>} A nova OSC criada (com dados combinados).
 */
export const createOscAndUser = async (oscData, userData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Cria o utilizador
    const userQuery = `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [userResult] = await connection.execute(userQuery, [
      userData.name,
      userData.email, // Email de LOGIN
      userData.password_hash,
      ROLES.OSC, // Role é sempre OSC aqui
      oscData.status || 'Ativo' // Usa status fornecido ou 'Ativo'
    ]);
    const newUserId = userResult.insertId;

    // Cria o registo OSC
    const oscQuery = `
      INSERT INTO oscs (id, cnpj, responsible, email, phone, address, assigned_contador_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(oscQuery, [
      newUserId,
      oscData.cnpj,
      oscData.responsible,
      oscData.email, // Email de CONTACTO (pode ser diferente)
      oscData.phone,
      oscData.address,
      oscData.assigned_contador_id
    ]);

    await connection.commit();
    return await findById(newUserId); // Retorna dados combinados

  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação createOscAndUser:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Atualiza uma OSC e o seu Utilizador associado (usando Transação).
 * @param {number} oscId - O ID da OSC/Utilizador a ser atualizado.
 * @param {object} updateData - Dados a serem atualizados (name, responsible, email (contacto), phone, address, status).
 * @returns {Promise<object>} A OSC atualizada (com dados combinados).
 */
export const updateOscAndUser = async (oscId, updateData) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Atualiza a tabela 'oscs' (dados específicos)
    const oscFieldsToUpdate = [];
    const oscParams = [];
    // Campos permitidos na tabela 'oscs'
    const allowedOscFields = ['responsible', 'email', 'phone', 'address', 'assigned_contador_id'];
    allowedOscFields.forEach(field => {
        if (updateData[field] !== undefined) {
            oscFieldsToUpdate.push(`${field} = ?`);
            oscParams.push(updateData[field]);
        }
    });

    if (oscFieldsToUpdate.length > 0) {
        oscParams.push(oscId);
        const oscQuery = `UPDATE oscs SET ${oscFieldsToUpdate.join(', ')} WHERE id = ?`;
        await connection.execute(oscQuery, oscParams);
    }

    // 2. Atualiza a tabela 'users' (dados de login/identidade)
    const userFieldsToUpdate = [];
    const userParams = [];
    // Campos permitidos na tabela 'users' para OSC
    const allowedUserFields = ['name', 'status', 'email']; // 'email' aqui é o de LOGIN
    allowedUserFields.forEach(field => {
        // Renomeia 'email' para 'login_email' se vier de `findById`
        const dataKey = field === 'email' ? (updateData.login_email !== undefined ? 'login_email' : 'email') : field;
        if (updateData[dataKey] !== undefined) {
            userFieldsToUpdate.push(`${field} = ?`);
            userParams.push(updateData[dataKey]);
        }
    });

     if (userFieldsToUpdate.length > 0) {
        userParams.push(oscId);
        const userQuery = `UPDATE users SET ${userFieldsToUpdate.join(', ')} WHERE id = ?`;
        await connection.execute(userQuery, userParams);
    }


    await connection.commit();
    return await findById(oscId); // Retorna dados combinados atualizados

  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação updateOscAndUser:', error);
    throw error;
  } finally {
    connection.release();
  }
};


/**
 * Associa uma OSC a um Contador (Admin).
 * @param {number} oscId - O ID da OSC.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<object | null>} A OSC atualizada ou null se não encontrada.
 */
export const assignContador = async (oscId, contadorId) => {
  const [result] = await pool.execute(
    'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
    [contadorId, oscId]
  );
  if (result.affectedRows === 0) return null;
  return await findById(oscId);
};

/**
 * Apaga uma OSC e o seu Utilizador associado.
 * @param {number} oscId - O ID da OSC/Utilizador a ser apagado.
 * @returns {Promise<boolean>} True se foi apagado, false se não encontrado.
 */
export const deleteOscAndUser = async (oscId) => {
  // ON DELETE CASCADE na FK 'fk_osc_user' apaga o registo 'oscs' automaticamente
  const [result] = await pool.execute(
    'DELETE FROM users WHERE id = ? AND role = ?',
    [oscId, ROLES.OSC]
  );
  return result.affectedRows > 0;
};

/**
 * Encontra o Contador associado a uma OSC.
 * @param {number} oscId - O ID da OSC.
 * @returns {Promise<object | null>} O objeto do utilizador (Contador).
 */
export const findContadorForOsc = async (oscId) => {
  const query = `
    SELECT u.id, u.name, u.email, u.role
    FROM users u
    JOIN oscs o ON u.id = o.assigned_contador_id
    WHERE o.id = ? AND u.role = '${ROLES.CONTADOR}'
  `;
  const [rows] = await pool.execute(query, [oscId]);
  return rows[0] || null;
};

/**
 * Verifica se uma OSC está associada a um Contador.
 * @param {number} oscId - O ID da OSC.
 * @param {number} contadorId - O ID do Contador.
 * @returns {Promise<boolean>} True se estiverem associados.
 */
export const isOscAssignedToContador = async (oscId, contadorId) => {
  const [rows] = await pool.execute(
    'SELECT id FROM oscs WHERE id = ? AND assigned_contador_id = ?',
    [oscId, contadorId]
  );
  return rows.length > 0;
};

/**
 * Conta o número de OSCs ATIVAS associadas a um Contador específico.
 * (CORRIGIDO com JOIN em 'users')
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<number>} O número de OSCs ativas.
 */
export const countActiveByContadorId = async (contadorId) => {
  const query = `
    SELECT COUNT(o.id) as count
    FROM oscs o
    JOIN users u ON o.id = u.id -- Liga oscs.id com users.id
    WHERE o.assigned_contador_id = ? AND u.status = 'Ativo' AND u.role = '${ROLES.OSC}'
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId]);
    return rows[0].count;
  } catch (error) {
    console.error('Erro em countActiveByContadorId:', error);
    throw new Error('Erro ao contar OSCs ativas.');
  }
};