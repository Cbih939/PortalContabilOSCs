// backend/src/services/governance.service.js

import pool from '../config/db.js';

/**
 * Função que verifica os mandatos das OSCs e gera alertas automáticos.
 */
export const checkMandatesAndAlert = async () => {
  try {
    // 1. Busca todas as OSCs cujo mandato expira nos próximos 60 dias
    const [oscs] = await pool.execute(`
        SELECT id, name, razao_social, fim_mandato, assigned_contador_id
        FROM oscs
        WHERE fim_mandato IS NOT NULL
          AND fim_mandato BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 60 DAY)
    `);

    for (const osc of oscs) {
        // 2. Verifica se já enviámos este aviso automático nos últimos 60 dias (para não fazer spam)
        const [existingAlert] = await pool.execute(`
            SELECT id FROM alerts
            WHERE osc_id = ? 
              AND title = 'Aviso Automático: Vencimento de Mandato'
              AND created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        `, [osc.id]);

        if (existingAlert.length === 0) {
            // 3. Formata a data para formato PT-BR
            const endDate = new Date(osc.fim_mandato).toLocaleDateString('pt-BR');
            
            // 4. Cria a mensagem do alerta
            const message = `Atenção! O mandato da diretoria atual vence no dia ${endDate}. \n\nLembre-se de organizar a nova eleição e providenciar a ata em tempo hábil para evitar irregularidades na governança e bloqueios bancários.`;

            // 5. Insere o alerta na base de dados (assinado pelo contador da OSC ou pelo Admin)
            await pool.execute(`
                INSERT INTO alerts (osc_id, title, message, type, created_by_contador_id, read_status)
                VALUES (?, ?, ?, 'Urgente', ?, 0)
            `, [osc.id, 'Aviso Automático: Vencimento de Mandato', message, osc.assigned_contador_id || 1]);
            
            console.log(`[Governança] 🛡️ Alerta de mandato criado automaticamente para a OSC ID: ${osc.id}`);
        }
    }
  } catch (error) {
    console.error('[Governança] ❌ Erro ao verificar mandatos:', error);
  }
};

/**
 * Inicia o Cron Job (Tarefa Agendada) que corre uma vez por dia
 */
export const startGovernanceCron = () => {
    console.log('[Governança] 🤖 Robô de monitorização de mandatos iniciado.');
    
    // Corre imediatamente ao ligar o servidor
    checkMandatesAndAlert(); 
    
    // Configura para correr a cada 24 horas (24 * 60 * 60 * 1000 milissegundos)
    setInterval(checkMandatesAndAlert, 24 * 60 * 60 * 1000);
};