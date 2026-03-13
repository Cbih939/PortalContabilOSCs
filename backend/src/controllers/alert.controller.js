// backend/src/controllers/alert.controller.js

import pool from '../config/db.js';
import { ROLES } from '../utils/constants.js'; 

/**
 * @desc    Busca todos os alertas para a OSC logada ou histórico do Contador.
 * @route   GET /api/alerts
 * @access  Privado
 */
export const getMyAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';

    let alerts = [];

    if (userRole === 'CONTADOR') {
      const [rows] = await pool.execute('SELECT * FROM alerts WHERE created_by_contador_id = ? ORDER BY created_at DESC', [userId]);
      alerts = rows;
    } else {
      // 1. Busca a OSC e o contador responsável por ela
      const [oscRows] = await pool.execute('SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', [userId]);
      
      if (oscRows && oscRows.length > 0) {
         const internalOscId = oscRows[0].id;
         const assignedContadorId = oscRows[0].assigned_contador_id;
         
         let oscOfficeId = null;
         
         // 2. Descobre de que escritório o contador pertence
         if (assignedContadorId) {
            const [userRows] = await pool.execute('SELECT office_id FROM users WHERE id = ?', [assignedContadorId]);
            if (userRows && userRows.length > 0) {
               oscOfficeId = userRows[0].office_id;
            }
         }

         const safeOscId = internalOscId || null;
         const safeOfficeId = oscOfficeId || null;

         // 3. Busca na tabela ALERTS os avisos da OSC ou do ESCRITÓRIO
         const [alertsRows] = await pool.execute(`
            SELECT a.* FROM alerts a
            LEFT JOIN users u ON a.created_by_contador_id = u.id
            WHERE a.osc_id = ? OR (a.osc_id IS NULL AND u.office_id = ?)
            ORDER BY a.created_at DESC
         `, [safeOscId, safeOfficeId]);

         // Prepara os dados com os nomes que o Frontend espera ler
         alerts = alertsRows.map(alert => ({
             ...alert,
             read: !!alert.read_status,
             is_read: !!alert.read_status,
             date: alert.created_at
         }));
      }
    }

    return res.status(200).json(alerts);
  } catch (error) {
    console.error('[GetMyAlerts] Erro fatal:', error);
    return res.status(500).json({ message: 'Erro ao buscar alertas.', detalheErro: error.message });
  }
};

/**
 * @desc    Cria um novo alerta/aviso para uma ou mais OSCs.
 * @route   POST /api/alerts OU POST /api/notices
 * @access  Privado (Contador)
 */
export const createAlert = async (req, res) => {
  try {
    let { oscId, title, message, type } = req.body;
    const fromContadorId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({ message: 'Título e mensagem são obrigatórios.' });
    }

    if (String(oscId) === 'all' || String(oscId) === 'null' || !oscId) {
        oscId = null;
    }

    const alertType = type || (req.path.includes('/alerts') ? 'Urgente' : 'Informativo');

    // Insere na tabela ALERTS com read_status
    const [result] = await pool.execute(`
      INSERT INTO alerts (osc_id, title, message, type, created_by_contador_id, read_status) 
      VALUES (?, ?, ?, ?, ?, 0)
    `, [oscId, title, message, alertType, fromContadorId]);

    const [newAlert] = await pool.execute('SELECT * FROM alerts WHERE id = ?', [result.insertId]);
    
    // Devolve o aviso recém criado no formato amigável para o Frontend
    const responseAlert = {
        ...newAlert[0],
        read: !!newAlert[0].read_status,
        date: newAlert[0].created_at
    };

    return res.status(201).json(responseAlert); 

  } catch (error) {
    console.error('[Create Alert] Erro:', error);
    return res.status(500).json({ message: 'Erro ao criar aviso.', detalheErro: error.message });
  }
};

/**
 * @desc    Marca um alerta específico como lido.
 * @route   PATCH /api/alerts/:alertId/read
 * @access  Privado (OSC)
 */
export const markAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    if (req.user.role !== ROLES.OSC) return res.status(403).json({ message: 'Acesso negado.' });

    // Atualiza o read_status na tabela alerts
    await pool.execute('UPDATE alerts SET read_status = 1 WHERE id = ?', [alertId]);
    return res.status(200).json({ success: true, message: 'Alerta lido.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao marcar como lido.', detalheErro: error.message });
  }
};

/**
 * @desc    Busca o histórico de avisos enviados pelo Contador logado.
 */
export const getSentNoticesHistory = async (req, res) => {
  try {
    const contadorId = req.user.id;
    const [notices] = await pool.execute('SELECT * FROM alerts WHERE created_by_contador_id = ? ORDER BY created_at DESC', [contadorId]);

    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
        let oscName = 'Todas as OSCs';
        if (notice.osc_id) {
            const [oscRow] = await pool.execute('SELECT name, razao_social FROM oscs WHERE id = ?', [notice.osc_id]);
            oscName = oscRow[0]?.name || oscRow[0]?.razao_social || 'OSC Desconhecida';
        }
        return { 
            ...notice, 
            oscName,
            read: !!notice.read_status,
            date: notice.created_at
        };
    }));

    return res.status(200).json(enrichedNotices);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar histórico.', detalheErro: error.message });
  }
};

export const updateAlert = async (req, res) => res.status(501).json({ message: "Em desenvolvimento" });
export const deleteAlert = async (req, res) => res.status(501).json({ message: "Em desenvolvimento" });