import pool from '../config/db.js';

/**
 * Função global para registar ações no sistema (A Caixa Preta)
 */
export const logAction = async (userId, userName, oscId, action, module, details) => {
  try {
    // 🛡️ PROTEÇÃO EXTRA: Se o nome vier vazio (porque o token só tem o ID), 
    // nós vamos procurá-lo diretamente na base de dados!
    let finalName = userName;
    
    if (!finalName) {
      const [userRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
      if (userRows.length > 0) {
        finalName = userRows[0].name;
      } else {
        finalName = 'Utilizador Desconhecido';
      }
    }

    await pool.execute(
      `INSERT INTO system_logs (user_id, user_name, osc_id, action, module, details) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, finalName, oscId || null, action, module, details]
    );

    // Aviso no terminal do servidor para termos a certeza que gravou!
    console.log(`[AUDITORIA] Ação gravada: ${action} em ${module} por ${finalName}`);

  } catch (error) {
    // Se der erro, mostra no terminal da VPS para nós sabermos o que foi
    console.error('[ERRO DE AUDITORIA] Falha ao gravar log no banco de dados:', error);
  }
};