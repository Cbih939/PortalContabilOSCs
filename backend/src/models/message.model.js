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
    // Define 'from' e 'to' baseado no 'sender_role'
    from: row.sender_role === ROLES.OSC ? row.from_name : 'Contador', // Ajuste 'Contador' se necessário
    to: row.sender_role === ROLES.OSC ? 'Contador' : row.from_name,    // Ajuste 'Contador' se necessário
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

  // Retorna a mensagem recém-criada (busca para obter a data gerada pelo DB)
  const [newMessages] = await pool.execute(
    `SELECT 
       m.id, m.text, m.created_at as date, m.sender_role, m.from_name,
       u_osc.name as osc_name -- Busca nome da OSC para a propriedade 'to'
     FROM messages m 
     JOIN users u_osc ON m.osc_id = u_osc.id
     WHERE m.id = ?`,
    [result.insertId]
  );
  
  const newMessage = newMessages[0];
  
  // Formata a resposta para corresponder ao que o frontend espera
  return {
    id: newMessage.id,
    text: newMessage.text,
    date: newMessage.date,
    from: newMessage.from_name,
    to: newMessage.sender_role === ROLES.OSC ? ROLES.CONTADOR : newMessage.osc_name, // Define 'to'
  };
};

// --- NOVA FUNÇÃO PARA O DASHBOARD DO CONTADOR ---

/**
 * Conta o número de mensagens NÃO LIDAS destinadas a um Contador.
 * (Assume coluna 'read_status' BOOLEAN/TINYINT onde false/0 = não lida)
 * @param {number} contadorId - O ID do utilizador (Contador).
 * @returns {Promise<number>} O número de mensagens não lidas.
 */
export const countUnreadByContadorId = async (contadorId) => { // <-- Função incluída e exportada
  const query = `
    SELECT COUNT(*) as count
    FROM messages
    WHERE contador_id = ?
      AND sender_role = ? 
      AND read_status = false 
  `; // read_status = false pode precisar ser 0
  try {
    const [rows] = await pool.execute(query, [contadorId, ROLES.OSC]);
    return rows[0].count;
  } catch (error) {
    console.error('Erro em countUnreadByContadorId:', error);
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.sqlMessage.includes('read_status')) {
        console.warn("[Aviso] A coluna 'read_status' parece não existir na tabela 'messages'. Execute a migração correspondente.");
        return 0; 
    }
    throw new Error('Erro ao contar mensagens não lidas.');
  }
};

// (Futuramente, adicione aqui funções como markAsRead, etc.)