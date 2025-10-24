// backend/src/models/message.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL
import { ROLES } from '../utils/constants.js';

/**
 * Busca o histórico de conversa entre uma OSC e um Contador.
 * @param {number} oscId - O ID da OSC.
 * @param {number} contadorId - O ID do Contador.
 * @returns {Promise<Array>} Um array de objetos de mensagem.
 */
export const findConversationHistory = async (oscId, contadorId) => {
  const query = `
    SELECT 
      m.id,
      m.text,
      m.created_at as date,
      m.sender_role,
      u.name as from_name 
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE 
      m.osc_id = ? AND m.contador_id = ?
    ORDER BY 
      m.created_at ASC; 
  `;
  
  const [rows] = await pool.execute(query, [oscId, contadorId]);

  // Mapeia os dados para o formato esperado pelo frontend (do protótipo)
  return rows.map(row => ({
    id: row.id,
    text: row.text,
    date: row.date,
    from: row.from_name,
    // Define 'to' baseado no sender_role
    to: row.sender_role === ROLES.OSC ? 'Contador' : row.from_name, // O 'to' é o oposto do 'from'
  }));
};

/**
 * Cria um novo registo de mensagem no banco de dados.
 * @param {object} messageData - Os dados a serem inseridos.
 * @returns {Promise<object>} O novo objeto de mensagem criado.
 */
export const createMessage = async (messageData) => {
  const {
    osc_id,
    contador_id,
    text,
    sender_role,
    sender_id,
    from_name 
  } = messageData;

  const query = `
    INSERT INTO messages 
      (osc_id, contador_id, text, sender_role, sender_id, from_name, read_status) 
    VALUES (?, ?, ?, ?, ?, ?, FALSE) -- Assume read_status inicia como FALSE (0)
  `;
  
  const [result] = await pool.execute(query, [
    osc_id,
    contador_id,
    text,
    sender_role,
    sender_id,
    from_name
  ]);

  // Retorna a mensagem recém-criada
  const [newMessages] = await pool.execute(
    `SELECT 
       m.id, m.text, m.created_at as date, m.sender_role, m.from_name,
       u_osc.name as osc_name
     FROM messages m 
     JOIN users u_osc ON m.osc_id = u_osc.id
     WHERE m.id = ?`,
    [result.insertId]
  );
  
  const newMessage = newMessages[0];
  
  return {
    id: newMessage.id,
    text: newMessage.text,
    date: newMessage.date,
    from: newMessage.from_name,
    to: newMessage.sender_role === ROLES.OSC ? 'Contador' : newMessage.osc_name,
  };
};

/**
 * Conta o número de mensagens NÃO LIDAS destinadas a um Contador.
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<number>} O número de mensagens não lidas.
 */
export const countUnreadByContadorId = async (contadorId) => {
  const query = `
    SELECT COUNT(*) as count
    FROM messages
    WHERE contador_id = ?
      AND sender_role = ? 
      AND read_status = false 
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId, ROLES.OSC]);
    return rows[0].count;
  } catch (error) {
    console.error('Erro em countUnreadByContadorId:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('read_status')) {
        console.warn("[Aviso] A coluna 'read_status' parece não existir na tabela 'messages'. Execute a migração.");
        return 0; 
    }
    throw new Error('Erro ao contar mensagens não lidas.');
  }
};

/**
 * Busca as N mensagens mais recentes não lidas para um Contador.
 * (Usado pelo Controlador de Notificações)
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @param {number} limit - Quantidade a buscar.
 * @returns {Promise<Array>} Um array de objetos de mensagem.
 */
export const findRecentUnreadByContadorId = async (contadorId, limit = 5) => {
  const query = `
    SELECT 
      m.id, m.text, m.created_at as date, m.osc_id,
      u.name as from_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.contador_id = ?
      AND m.sender_role = ?
      AND m.read_status = false
    ORDER BY m.created_at DESC
    LIMIT ?
  `;
  try {
    const [rows] = await pool.execute(query, [contadorId, ROLES.OSC, limit]);
    return rows;
  } catch (error) {
    console.error('Erro em findRecentUnreadByContadorId (Message):', error);
    throw error; // Propaga o erro para o controlador
  }
};