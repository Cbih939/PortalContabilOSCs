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
  // A query busca todas as mensagens onde a 'conversa'
  // é definida pela combinação osc_id E contador_id.
  // Também faz um JOIN na tabela 'users' (usando sender_id)
  // para obter o nome de quem enviou.
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
  `; // ASC (Ascendente) para ordem de chat (mais antigo primeiro)
  
  const [rows] = await pool.execute(query, [oscId, contadorId]);

  // Mapeia os dados para o formato esperado pelo frontend (do protótipo)
  return rows.map(row => ({
    id: row.id,
    text: row.text,
    date: row.date,
    // Define 'from' e 'to' baseado no 'sender_role'
    // (Isto é baseado no protótipo, onde o nome era o identificador)
    from: row.sender_role === ROLES.OSC ? row.from_name : ROLES.CONTADOR,
    to: row.sender_role === ROLES.OSC ? ROLES.CONTADOR : row.from_name,
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
    from_name // (Campo do protótipo)
  } = messageData;

  const query = `
    INSERT INTO messages 
      (osc_id, contador_id, text, sender_role, sender_id, from_name) 
    VALUES (?, ?, ?, ?, ?, ?)
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
    'SELECT * FROM messages WHERE id = ?',
    [result.insertId]
  );
  
  const newMessage = newMessages[0];
  
  // Formata a resposta para corresponder ao que o frontend espera
  return {
    id: newMessage.id,
    text: newMessage.text,
    date: newMessage.created_at,
    from: newMessage.from_name, // O 'from_name' que salvámos
    to: sender_role === ROLES.OSC ? ROLES.CONTADOR : 'Nome da OSC', // (O frontend pode preencher isto)
  };
};