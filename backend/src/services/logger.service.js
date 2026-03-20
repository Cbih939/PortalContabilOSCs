import pool from '../config/db.js';

/**
 * Função global para registar ações no sistema (A Caixa Preta)
 * * @param {number} userId - ID do usuário que fez a ação
 * @param {string} userName - Nome do usuário
 * @param {number|null} oscId - ID da OSC afetada (se aplicável)
 * @param {string} action - Ação realizada (CRIOU, EDITOU, EXCLUIU, STATUS)
 * @param {string} module - Módulo afetado (OSC, DOCUMENTO, DIRETORIA, SISTEMA)
 * @param {string} details - Detalhes em texto do que aconteceu
 */
export const logAction = async (userId, userName, oscId, action, module, details) => {
  try {
    await pool.execute(
      `INSERT INTO system_logs (user_id, user_name, osc_id, action, module, details) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, userName, oscId || null, action, module, details]
    );
  } catch (error) {
    // Não paramos o sistema se o log falhar, mas registamos no terminal
    console.error('[ERRO DE AUDITORIA] Falha ao gravar log:', error);
  }
};