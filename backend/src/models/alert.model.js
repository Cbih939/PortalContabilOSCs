// backend/src/models/alert.model.js

import pool from '../config/db.js'; // Importa o pool de conexões MySQL

/**
 * Busca todos os alertas destinados a uma OSC específica.
 * @param {number} oscId - O ID da OSC (utilizador).
 * @returns {Promise<Array>} Um array de objetos de alerta.
 */
export const findAlertsByOSCId = async (oscId) => {
  // --- LÓGICA CORRIGIDA ---
  // Seleciona alertas onde o osc_id é o da OSC logada
  // OU onde o osc_id é NULL (alerta geral para todas as OSCs)
  const query = `
    SELECT
      id,
      title,
      message,
      created_at as date,
      read_status as 'read',
      type
    FROM alerts
    WHERE osc_id = ? OR osc_id IS NULL
    ORDER BY read_status ASC, created_at DESC
  `;
  // --- FIM DA CORREÇÃO ---
  const [rows] = await pool.execute(query, [oscId]);

  // Converte o 'read_status' (TINYINT 0/1) para booleano (true/false)
  return rows.map(alert => ({
    ...alert,
    read: !!alert.read // Converte 0 para false, 1 para true
  }));
};

/**
 * Cria um novo alerta/aviso no banco de dados.
 * @param {object} alertData - { osc_id | null, title, message, type, created_by_contador_id }
 * @returns {Promise<object>} O novo objeto de alerta criado.
 */
export const createAlert = async (alertData) => {
  const { osc_id, title, message, type, created_by_contador_id } = alertData;

  const query = `
    INSERT INTO alerts
      (osc_id, title, message, type, created_by_contador_id, read_status)
    VALUES (?, ?, ?, ?, ?, false) -- Inicia como não lido (false/0)
  `;

  const [result] = await pool.execute(query, [
    osc_id, // Pode ser NULL se enviado para 'Todas'
    title,
    message,
    type,
    created_by_contador_id
  ]);

  // Busca e retorna o alerta recém-criado
  const [newAlerts] = await pool.execute(
    `SELECT
       id, osc_id, title, message, created_at as date, read_status as 'read', type
     FROM alerts WHERE id = ?`,
    [result.insertId]
  );

  const newAlert = newAlerts[0];
  if (!newAlert) throw new Error("Falha ao buscar alerta recém-criado."); // Segurança extra
  return { ...newAlert, read: !!newAlert.read };
};

/**
 * Marca um alerta específico como lido, garantindo que pertence à OSC correta.
 * @param {number} alertId - O ID do alerta a ser marcado.
 * @param {number} oscId - O ID da OSC que está a marcar como lido (para segurança).
 * @returns {Promise<object | null>} O alerta atualizado ou null se não for encontrado/pertencer à OSC.
 */
export const markAsRead = async (alertId, oscId) => {
  // Permite marcar como lido mesmo se osc_id for NULL (alerta geral), mas verifica o ID do alerta
  const query = `
    UPDATE alerts
    SET read_status = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND (osc_id = ? OR osc_id IS NULL) AND read_status = false
  `; // Garante que a OSC só marque alertas direcionados a ela ou a todos

  const [result] = await pool.execute(query, [alertId, oscId]);

  if (result.affectedRows === 0) {
    return null; // Não encontrado, não pertence, ou já estava lido.
  }

  // Busca e retorna o alerta atualizado
  const [updatedAlerts] = await pool.execute(
    `SELECT
       id, osc_id, title, message, created_at as date, read_status as 'read', type
     FROM alerts WHERE id = ?`,
    [alertId]
  );

  const updatedAlert = updatedAlerts[0];
  if (!updatedAlert) return null; // Segurança extra
  return { ...updatedAlert, read: !!updatedAlert.read };
};


/**
 * Busca todos os alertas/avisos enviados por um utilizador específico (Contador).
 * (Usado pelo Histórico do Canal de Avisos)
 * @param {number} senderId - O ID do utilizador (Contador) que enviou.
 * @returns {Promise<Array>} Um array de objetos de alerta/aviso.
 */
export const findNoticesBySenderId = async (senderId) => {
  // Busca alertas onde o 'created_by_contador_id' corresponde ao senderId
  // Ordena pelos mais recentes. Inclui osc_id para o controlador buscar o nome.
  const query = `
    SELECT
      id,
      osc_id, -- ID da OSC destinatária (ou NULL para 'Todas')
      title,
      message,
      created_at as date, -- Renomeia para 'date' para frontend
      read_status as 'read',
      type -- Assume que a coluna 'type' existe ('Informativo', 'Urgente', etc.)
    FROM alerts
    WHERE created_by_contador_id = ?
    ORDER BY created_at DESC
  `;
  try {
    const [rows] = await pool.execute(query, [senderId]);
    // Formata o 'read' para booleano
     return rows.map(alert => ({
        ...alert,
        read: !!alert.read // Converte 0/1 para false/true
    }));
  } catch (error) {
    console.error('Erro em findNoticesBySenderId:', error);
    // Verifica se erro é coluna 'type' ou 'created_by_contador_id' inexistente
    if (error.code === 'ER_BAD_FIELD_ERROR') {
        if (error.sqlMessage.includes('type')) {
            console.warn("[Aviso] A coluna 'type' parece não existir na tabela 'alerts'.");
            // Tenta buscar sem 'type'
            const [rows] = await pool.execute(query.replace(', type', ''), [senderId]);
             return rows.map(alert => ({ ...alert, read: !!alert.read }));
        }
        if (error.sqlMessage.includes('created_by_contador_id')) {
            console.warn("[Aviso] A coluna 'created_by_contador_id' parece não existir na tabela 'alerts'.");
            return []; // Retorna vazio
        }
    }
    throw new Error('Erro ao buscar histórico de avisos enviados.');
  }
};