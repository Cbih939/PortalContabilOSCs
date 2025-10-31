// backend/src/models/message.model.js

import pool from '../config/db.js';
import { ROLES } from '../utils/constants.js';

/**
 * Busca o histórico de conversa entre uma OSC e um Contador.
 */
export const findConversationHistory = async (oscId, contadorId) => {
  console.log(`[Model findConversationHistory] Buscando para osc_id: ${oscId} E contador_id: ${contadorId}`);
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
  try {
    const [rows] = await pool.execute(query, [oscId, contadorId]);
    console.log(`[Model findConversationHistory] Query encontrou ${rows.length} linhas.`);
    return rows.map(row => ({
      id: row.id,
      text: row.text,
      date: row.date,
      from: row.from_name,
      to: row.sender_role === ROLES.OSC ? 'Contador' : row.from_name,
    }));
  } catch (error) {
      console.error('Erro em findConversationHistory:', error);
      throw new Error('Erro ao buscar histórico de conversa.');
  }
};

/**
 * Cria um novo registo de mensagem no banco de dados.
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
    VALUES (?, ?, ?, ?, ?, ?, FALSE)
  `;
  try {
    const [result] = await pool.execute(query, [
      osc_id,
      contador_id,
      text,
      sender_role,
      sender_id,
      from_name
    ]);

    const [newMessages] = await pool.execute(
      `SELECT 
         m.id, m.text, m.created_at as date, m.sender_role, m.from_name,
         u_osc.name as osc_name,
         u_contador.name as contador_name
       FROM messages m 
       JOIN users u_osc ON m.osc_id = u_osc.id
       JOIN users u_contador ON m.contador_id = u_contador.id
       WHERE m.id = ?`,
      [result.insertId]
    );
    
    const newMessage = newMessages[0];
    if (!newMessage) throw new Error("Falha ao buscar mensagem recém-criada.");
    
    return {
      id: newMessage.id,
      text: newMessage.text,
      date: newMessage.date,
      from: newMessage.from_name,
      to: newMessage.sender_role === ROLES.OSC ? newMessage.contador_name : newMessage.osc_name,
    };
  } catch (error) {
    console.error('[createMessage Model] Erro ao inserir mensagem:', error);
    throw error;
  }
};

/**
 * Conta o número de mensagens NÃO LIDAS destinadas a um Contador.
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
        console.warn("[Aviso] A coluna 'read_status' parece não existir na tabela 'messages'.");
        return 0; 
    }
    throw new Error('Erro ao contar mensagens não lidas.');
  }
};

/**
 * Busca as N mensagens mais recentes não lidas para um Contador.
 * (Usado pelo Controlador de Notificações)
 * (CORRIGIDO com os 3 argumentos no pool.execute)
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
    // --- CORREÇÃO AQUI ---
    // Passando contadorId, ROLES.OSC, e limit
    const [rows] = await pool.execute(query, [contadorId, ROLES.OSC, limit]);
    // --- FIM DA CORREÇÃO ---
    return rows;
  } catch (error) {
    console.error('Erro em findRecentUnreadByContadorId (Message):', error);
    throw error;
  }
};