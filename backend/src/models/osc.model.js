// backend/src/models/osc.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca todas as OSCs com o nome do contador associado.
 * (Usado pelo Admin)
 * @returns {Promise<Array>} Lista de OSCs.
 */
export const findAllWithContador = async () => {
  // LEFT JOIN é usado caso uma OSC não tenha contador (assigned_contador_id IS NULL)
  const query = `
    SELECT 
      o.id,
      o.name,
      o.cnpj,
      o.responsible,
      o.status,
      u.name as contadorName
    FROM oscs o
    LEFT JOIN users u ON o.assigned_contador_id = u.id 
      AND u.role = '${ROLES.CONTADOR}'
    ORDER BY o.name ASC
  `;
  const [rows] = await pool.execute(query);
  return rows;
};

/**
 * Busca OSCs associadas a um Contador específico.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<Array>} Lista de OSCs.
 */
export const findByContadorId = async (contadorId) => {
  const query = `
    SELECT id, name, cnpj, responsible, email, phone, address, status
    FROM oscs
    WHERE assigned_contador_id = ?
    ORDER BY name ASC
  `;
  const [rows] = await pool.execute(query, [contadorId]);
  return rows;
};

/**
 * Busca uma OSC pelo seu ID (que é o mesmo ID do utilizador).
 * @param {number} id - O ID da OSC.
 * @returns {Promise<object | null>} A OSC ou null se não encontrada.
 */
export const findById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM oscs WHERE id = ?',
    [id]
  );
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
 * @param {object} oscData - Dados da tabela 'oscs' (name, cnpj, responsible, etc.).
 * @param {object} userData - Dados da tabela 'users' (name, email, password_hash, role).
 * @returns {Promise<object>} A nova OSC criada.
 */
export const createOscAndUser = async (oscData, userData) => {
  // 1. Pega uma conexão do pool para a transação
  const connection = await pool.getConnection();
  
  try {
    // 2. Inicia a Transação
    await connection.beginTransaction();

    // 3. Cria o registo na tabela 'users'
    const userQuery = `
      INSERT INTO users (name, email, password_hash, role) 
      VALUES (?, ?, ?, ?)
    `;
    const [userResult] = await connection.execute(userQuery, [
      userData.name,
      userData.email,
      userData.password_hash,
      userData.role
    ]);
    
    // 4. Pega o ID do utilizador recém-criado
    const newUserId = userResult.insertId;

    // 5. Cria o registo na tabela 'oscs' USANDO o mesmo ID
    const oscQuery = `
      INSERT INTO oscs (id, cnpj, responsible, email, phone, address, status, assigned_contador_id, name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(oscQuery, [
      newUserId, // O 'id' da OSC é o 'id' do utilizador
      oscData.cnpj,
      oscData.responsible,
      oscData.email,
      oscData.phone,
      oscData.address,
      oscData.status,
      oscData.assigned_contador_id,
      oscData.name // (A tabela 'oscs' também tem 'name' na migração 002)
    ]);

    // 6. Se tudo correu bem, 'comita' as alterações
    await connection.commit();

    // 7. Retorna a OSC recém-criada
    return await findById(newUserId);

  } catch (error) {
    // 8. Se algo falhou, reverte (rollback)
    await connection.rollback();
    console.error('Erro na transação createOscAndUser:', error);
    // Re-lança o erro para o controlador lidar (ex: ER_DUP_ENTRY)
    throw error;
  } finally {
    // 9. SEMPRE liberta a conexão de volta para o pool
    connection.release();
  }
};

/**
 * Atualiza uma OSC e o seu Utilizador associado (usando Transação).
 * @param {number} oscId - O ID da OSC/Utilizador a ser atualizado.
 * @param {object} oscData - Dados a serem atualizados (name, responsible, email, etc.).
 * @returns {Promise<object>} A OSC atualizada.
 */
export const updateOscAndUser = async (oscId, oscData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Atualiza a tabela 'oscs'
    //    (Filtra 'status' se não for fornecido, para não dar 'undefined')
    const oscQuery = `
      UPDATE oscs 
      SET name = ?, responsible = ?, email = ?, phone = ?, address = ?, 
          status = COALESCE(?, status) 
      WHERE id = ?
    `;
    await connection.execute(oscQuery, [
      oscData.name,
      oscData.responsible,
      oscData.email,
      oscData.phone,
      oscData.address,
      oscData.status, // Se 'status' for undefined, COALESCE usa o valor antigo
      oscId
    ]);
    
    // 2. Atualiza a tabela 'users' (nome e email podem ter mudado)
    const userQuery = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    await connection.execute(userQuery, [oscData.name, oscData.email, oscId]);

    // 3. Comita
    await connection.commit();
    
    // 4. Retorna os dados atualizados
    return await findById(oscId);

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
  // (O controlador deve ter verificado se o contadorId é um 'Contador' válido)
  const [result] = await pool.execute(
    'UPDATE oscs SET assigned_contador_id = ? WHERE id = ?',
    [contadorId, oscId]
  );
  
  if (result.affectedRows === 0) {
    return null; // OSC não encontrada
  }
  return await findById(oscId);
};

/**
 * Apaga uma OSC e o seu Utilizador associado.
 * @param {number} oscId - O ID da OSC/Utilizador a ser apagado.
 * @returns {Promise<boolean>} True se foi apagado, false se não encontrado.
 */
export const deleteOscAndUser = async (oscId) => {
  // Graças ao 'ON DELETE CASCADE' na migração 002,
  // só precisamos de apagar o registo na tabela 'users'.
  // O MySQL irá apagar automaticamente o registo na 'oscs'.
  const [result] = await pool.execute(
    'DELETE FROM users WHERE id = ? AND role = ?',
    [oscId, ROLES.OSC] // Segurança extra: só apaga se for uma OSC
  );
  
  return result.affectedRows > 0;
};

// --- Funções de Permissão (Helpers) ---

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