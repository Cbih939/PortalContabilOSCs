// backend/src/models/alert.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL

/**
 * Busca todos os alertas destinados a uma OSC específica.
 * @param {number} oscId - O ID da OSC (utilizador).
 * @returns {Promise<Array>} Um array de objetos de alerta.
 */
export const findAlertsByOSCId = async (oscId) => {
  // Ordena por 'created_at' DESC para mostrar os mais recentes primeiro,
  // e 'read_status' ASC para mostrar os não lidos ('false') antes dos lidos ('true').
  const query = `
    SELECT 
      id, 
      title, 
      message, 
      created_at as date, 
      read_status as 'read' -- Renomeia para corresponder ao frontend
    FROM alerts 
    WHERE osc_id = ?
    ORDER BY read_status ASC, created_at DESC
  `;
  const [rows] = await pool.execute(query, [oscId]);
  
  // Converte o 'read_status' (TINYINT 0/1) para booleano (true/false)
  return rows.map(alert => ({
    ...alert,
    read: !!alert.read // Converte 0 para false, 1 para true
  }));
};

/**
 * Cria um novo alerta no banco de dados.
 * @param {object} alertData - { oscId, title, message, created_by_contador_id }
 * @returns {Promise<object>} O novo objeto de alerta criado.
 */
export const createAlert = async (alertData) => {
  const { oscId, title, message, created_by_contador_id } = alertData;

  const query = `
    INSERT INTO alerts 
      (osc_id, title, message, created_by_contador_id, read_status) 
    VALUES (?, ?, ?, ?, false) -- Inicia como não lido (false/0)
  `;
  
  const [result] = await pool.execute(query, [
    oscId,
    title,
    message,
    created_by_contador_id // Pode ser null se enviado pelo sistema ou Admin
  ]);

  // Busca e retorna o alerta recém-criado
  const [newAlerts] = await pool.execute(
    `SELECT 
       id, title, message, created_at as date, read_status as 'read' 
     FROM alerts WHERE id = ?`,
    [result.insertId]
  );
  
  const newAlert = newAlerts[0];
  return { ...newAlert, read: !!newAlert.read };
};

/**
 * Marca um alerta específico como lido, garantindo que pertence à OSC correta.
 * @param {number} alertId - O ID do alerta a ser marcado.
 * @param {number} oscId - O ID da OSC que está a marcar como lido (para segurança).
 * @returns {Promise<object | null>} O alerta atualizado ou null se não for encontrado/pertencer à OSC.
 */
export const markAsRead = async (alertId, oscId) => {
  const query = `
    UPDATE alerts 
    SET read_status = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND osc_id = ? AND read_status = false
  `; // Só atualiza se for o 'id' correto, da 'oscId' correta E ainda não estiver lido
  
  const [result] = await pool.execute(query, [alertId, oscId]);

  // Verifica se alguma linha foi realmente atualizada
  if (result.affectedRows === 0) {
    // Pode ser que o alerta não exista, não pertença à OSC, ou já estava lido.
    // Retorna null para o controlador saber que nada mudou ou falhou a validação.
    return null;
  }

  // Busca e retorna o alerta atualizado
  const [updatedAlerts] = await pool.execute(
    `SELECT 
       id, title, message, created_at as date, read_status as 'read' 
     FROM alerts WHERE id = ?`,
    [alertId]
  );
  
  const updatedAlert = updatedAlerts[0];
  return { ...updatedAlert, read: !!updatedAlert.read };
};