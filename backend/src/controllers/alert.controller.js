// backend/src/controllers/alert.controller.js

// Importa os modelos
import * as AlertModel from '../models/alert.model.js';
import * as OscModel from '../models/osc.model.js'; // Para buscar nomes de OSC
import * as UserModel from '../models/user.model.js'; // Para buscar nomes de OSC (via ID)
import { ROLES } from '../utils/constants.js'; // Para comparar roles

/**
 * @desc    Busca todos os alertas para a OSC logada.
 * @route   GET /api/alerts
 * @access  Privado (OSC)
 */
export const getMyAlerts = async (req, res) => {
  try {
    const oscId = req.user.id;
    if (req.user.role !== ROLES.OSC) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const alerts = await AlertModel.findAlertsByOSCId(oscId);
    res.status(200).json(alerts);
  } catch (error) {
    console.error('[GetMyAlerts] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar alertas.' });
  }
};

/**
 * @desc    Cria um novo alerta/aviso para uma ou mais OSCs.
 * @route   POST /api/alerts OU POST /api/notices
 * @access  Privado (Contador)
 * @body    { oscId: (number|null), title: string, message: string, type: string? } // Aceita oscId
 */
export const createAlert = async (req, res) => {
  try {
    // --- LOG DE DEBUG ---
    console.log('[Create Alert] Corpo da Requisição Recebido:', req.body);

    // !! CORREÇÃO: Aceita oscId do frontend !!
    const { oscId, title, message, type } = req.body;
    const fromContadorId = req.user.id;

    // Validação básica
    if (!title || !message) {
      console.log('[Create Alert] Erro 400: Título ou Mensagem em falta.');
      return res.status(400).json({
        message: 'Título e mensagem são obrigatórios.'
      });
    }
    // Verifica se oscId foi enviado (mesmo que seja null)
    if (oscId === undefined) {
         console.log('[Create Alert] Erro 400: Campo oscId (mesmo que null) é esperado.');
         return res.status(400).json({ message: 'Campo oscId inválido ou em falta.' });
    }

    // Prepara dados para o modelo (usa osc_id com underscore)
    const newAlertData = {
      osc_id: oscId, // Converte para o nome da coluna no DB
      title,
      message,
      // Define tipo (Urgente para /alerts, padrão para /notices)
      type: type || (req.path.includes('/alerts') ? 'Urgente' : 'Informativo'),
      created_by_contador_id: fromContadorId,
    };

    // --- LOG DE DEBUG ---
    console.log('[Create Alert] Dados a serem salvos:', newAlertData);

    const createdAlert = await AlertModel.createAlert(newAlertData);

     // --- LOG DE DEBUG ---
     console.log('[Create Alert] Alerta criado com sucesso:', createdAlert);

    res.status(201).json(createdAlert); // Retorna 201 Created

  } catch (error) {
    // --- LOG DE DEBUG ---
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
    const oscId = req.user.id;

    if (!alertId) {
      return res.status(400).json({ message: 'ID do alerta não fornecido.' });
    }
    if (req.user.role !== ROLES.OSC) {
        return res.status(403).json({ message: 'Acesso negado.' });
    }

    const updatedAlert = await AlertModel.markAsRead(alertId, oscId);

    if (!updatedAlert) {
      return res.status(404).json({
        message: 'Alerta não encontrado, não pertence a este utilizador ou já estava lido.'
      });
    }

    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('[MarkAsRead] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar alerta.' });
  }
};


/**
 * @desc    Busca o histórico de avisos enviados pelo Contador logado.
 * @route   GET /api/notices/history
 * @access  Privado (Contador)
 */
export const getSentNoticesHistory = async (req, res) => {
  try {
    const contadorId = req.user.id;
    console.log(`[GetSentHistory] Buscando histórico para Contador ID: ${contadorId}`); // Log

    const notices = await AlertModel.findNoticesBySenderId(contadorId);
    console.log(`[GetSentHistory] Modelo retornou ${notices.length} avisos.`); // Log

    // Enriquecer com nome da OSC
    const enrichedNotices = await Promise.all(notices.map(async (notice) => {
        let oscName = 'Todas as OSCs';
        if (notice.osc_id) {
            // Busca o nome na tabela 'users' usando o ID da OSC
            // NOTA: OscModel.findById busca JOIN com users, mais eficiente
            const osc = await OscModel.findById(notice.osc_id);
            oscName = osc?.name || 'OSC Desconhecida';
        }
        return { ...notice, oscName }; // Adiciona oscName ao objeto
    }));

     console.log('[GetSentHistory] Retornando histórico enriquecido.'); // Log
    res.status(200).json(enrichedNotices);

  } catch (error) {
    console.error('[GetSentHistory] Erro no controlador:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar histórico de avisos.' });
  }
};