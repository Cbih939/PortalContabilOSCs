// backend/src/controllers/alert.controller.js

import pool from '../config/db.js'; // IMPORTAÇÃO DIRETA PARA RESOLVER O PROBLEMA DOS AVISOS
import * as AlertModel from '../models/alert.model.js';
import * as OscModel from '../models/osc.model.js'; 
import * as UserModel from '../models/user.model.js'; 
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
    const officeId = req.user.office_id; // Pega o escritório do usuário

    let alerts = [];

    if (userRole === 'CONTADOR') {
      // O Contador vê o histórico de todos os avisos que ele enviou
      const [rows] = await pool.execute(`
        SELECT * FROM notices 
        WHERE created_by_contador_id = ? 
        ORDER BY created_at DESC
      `, [userId]);
      alerts = rows;
    } else {
      // A OSC VÊ DUAS COISAS AGORA:
      // 1. Avisos mandados diretamente para o ID dela
      // 2. Avisos "Gerais" (onde osc_id é nulo) mandados por alguém do MESMO ESCRITÓRIO dela!
      
      // Primeiro, descobre qual é o ID interno da OSC (tabela oscs) baseada no userId
      const [oscData] = await pool.execute('SELECT id, office_id FROM oscs WHERE user_id = ?', [userId]);
      const internalOscId = oscData[0]?.id;
      const oscOfficeId = oscData[0]?.office_id;

      if (internalOscId) {
        const [rows] = await pool.execute(`
          SELECT n.* FROM notices n
          LEFT JOIN users u ON n.created_by_contador_id = u.id
          WHERE n.osc_id = ? 
             OR (n.osc_id IS NULL AND u.office_id = ?)
          ORDER BY n.created_at DESC
        `, [internalOscId, oscOfficeId]);
        alerts = rows;
      }
    }

    res.status(200).json(alerts);
  } catch (error) {
    console.error('[GetMyAlerts] Erro:', error);
    res.status(500).json({ message: 'Erro ao buscar alertas.' });
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

    // Se oscId for 'all' ou 'null' (string), nós forçamos para nulo de verdade no banco de dados
    if (String(oscId) === 'all' || String(oscId) === 'null' || !oscId) {
        oscId = null;
    }

    const alertType = type || (req.path.includes('/alerts') ? 'Urgente' : 'Informativo');

    // Inserção direta usando pool para garantir que os nomes das colunas batem certinho com a tabela `notices`
    const [result] = await pool.execute(`
      INSERT INTO notices (osc_id, title, message, type, created_by_contador_id, is_read) 
      VALUES (?, ?, ?, ?, ?, 0)
    `, [oscId, title, message, alertType, fromContadorId]);

    // Busca o aviso recém criado para devolver ao Frontend
    const [newAlert] = await pool.execute('SELECT * FROM notices WHERE id = ?', [result.insertId]);

    res.status(201).json(newAlert[0]); 

  } catch (error) {
    console.error('[Create Alert] Erro INESPERADO:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar alerta/aviso.' });
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
    
    if (req.user.role !== ROLES.OSC) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    // Atualiza diretamente na base de dados
    await pool.execute('UPDATE notices SET is_read = 1 WHERE id = ?', [alertId]);

    res.status(200).json({ success: true, message: 'Alerta lido.' });
  } catch (error) {
    console.error('[MarkAsRead] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar alerta.' });
  }
};


/**
 * @desc    Busca o histórico de avisos enviados pelo Contador logado.
 */
export const getSentNoticesHistory = async (req, res) => {
  try {
    const contadorId = req.user.id;

    // Busca todos os avisos deste contador
    const [notices] = await pool.execute(`
        SELECT * FROM notices WHERE created_by_contador_id = ? ORDER BY created_at DESC
    `, [contadorId]);

    // Enriquecer com nome da OSC
    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
        let oscName = 'Todas as OSCs';
        if (notice.osc_id) {
            const [oscRow] = await pool.execute('SELECT name, razao_social FROM oscs WHERE id = ?', [notice.osc_id]);
            oscName = oscRow[0]?.name || oscRow[0]?.razao_social || 'OSC Desconhecida';
        }
        return { ...notice, oscName };
    }));

    res.status(200).json(enrichedNotices);
  } catch (error) {
    console.error('[GetSentHistory] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico de avisos.' });
  }
};

export const updateAlert = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade em desenvolvimento" });
};

export const deleteAlert = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade em desenvolvimento" });
};