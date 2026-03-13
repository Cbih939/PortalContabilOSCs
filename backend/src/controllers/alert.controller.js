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
      const [rows] = await pool.execute('SELECT * FROM notices WHERE created_by_contador_id = ? ORDER BY created_at DESC', [userId]);
      alerts = rows;
    } else {
      // 1. Busca a OSC e o contador responsável por ela de forma segura
      const [oscRows] = await pool.execute('SELECT id, assigned_contador_id FROM oscs WHERE user_id = ?', [userId]);
      
      if (oscRows && oscRows.length > 0) {
         const internalOscId = oscRows[0].id;
         const assignedContadorId = oscRows[0].assigned_contador_id;
         
         let oscOfficeId = null;
         
         // 2. Se a OSC tem um contador, vamos ver de que escritório ele é
         if (assignedContadorId) {
            const [userRows] = await pool.execute('SELECT office_id FROM users WHERE id = ?', [assignedContadorId]);
            if (userRows && userRows.length > 0) {
               oscOfficeId = userRows[0].office_id;
            }
         }

         // Garantia anti-crash: MySQL odeia undefined, forçamos para null
         const safeOscId = internalOscId || null;
         const safeOfficeId = oscOfficeId || null;

         // 3. Busca avisos diretos ou avisos gerais do mesmo escritório
         const [noticesRows] = await pool.execute(`
            SELECT n.* FROM notices n
            LEFT JOIN users u ON n.created_by_contador_id = u.id
            WHERE n.osc_id = ? OR (n.osc_id IS NULL AND u.office_id = ?)
            ORDER BY n.created_at DESC
         `, [safeOscId, safeOfficeId]);

         alerts = noticesRows;
      }
    }

    return res.status(200).json(alerts);
  } catch (error) {
    console.error('[GetMyAlerts] Erro fatal:', error);
    // Se falhar, mandamos o erro exato para podermos ler no navegador!
    return res.status(500).json({ 
        message: 'Erro ao buscar alertas.', 
        detalheErro: error.message 
    });
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

    const [result] = await pool.execute(`
      INSERT INTO notices (osc_id, title, message, type, created_by_contador_id, is_read) 
      VALUES (?, ?, ?, ?, ?, 0)
    `, [oscId, title, message, alertType, fromContadorId]);

    const [newAlert] = await pool.execute('SELECT * FROM notices WHERE id = ?', [result.insertId]);
    return res.status(201).json(newAlert[0]); 

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

    await pool.execute('UPDATE notices SET is_read = 1 WHERE id = ?', [alertId]);
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
    const [notices] = await pool.execute('SELECT * FROM notices WHERE created_by_contador_id = ? ORDER BY created_at DESC', [contadorId]);

    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
        let oscName = 'Todas as OSCs';
        if (notice.osc_id) {
            const [oscRow] = await pool.execute('SELECT name, razao_social FROM oscs WHERE id = ?', [notice.osc_id]);
            oscName = oscRow[0]?.name || oscRow[0]?.razao_social || 'OSC Desconhecida';
        }
        return { ...notice, oscName };
    }));

    return res.status(200).json(enrichedNotices);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar histórico.', detalheErro: error.message });
  }
};

export const updateAlert = async (req, res) => res.status(501).json({ message: "Em desenvolvimento" });
export const deleteAlert = async (req, res) => res.status(501).json({ message: "Em desenvolvimento" });