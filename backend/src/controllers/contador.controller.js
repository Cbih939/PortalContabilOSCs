// backend/src/controllers/contador.controller.js

// Importa os modelos necessários
import * as OscModel from '../models/osc.model.js';
import * as DocumentModel from '../models/document.model.js';
import * as MessageModel from '../models/message.model.js';
import { ROLES } from '../utils/constants.js'; // Garanta que ROLES está importado

/**
 * @desc    Busca estatísticas para o Dashboard do Contador.
 * @route   GET /api/contador/dashboard/stats
 * @access  Privado (Contador)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id; // ID do contador logado

    // 1. Contar OSCs Ativas associadas (Função corrigida no modelo)
    const activeOscCount = await OscModel.countActiveByContadorId(contadorId);

    // 2. Contar Documentos Pendentes (Ex: todos os recebidos)
    const pendingDocsCount = await DocumentModel.countReceivedByContadorId(contadorId);

    // 3. Contar Mensagens Não Lidas (Função corrigida no modelo)
    const unreadMessagesCount = await MessageModel.countUnreadByContadorId(contadorId);

    res.status(200).json({
      activeOSCs: activeOscCount,
      pendingDocs: pendingDocsCount,
      unreadMessages: unreadMessagesCount,
    });

  } catch (error) {
    console.error('Erro no controlador getDashboardStats:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar estatísticas.' });
  }
};

/**
 * @desc    Busca atividades recentes para o Dashboard do Contador.
 * @route   GET /api/contador/dashboard/activity
 * @access  Privado (Contador)
 */
export const getRecentActivity = async (req, res) => {
  try {
    const contadorId = req.user.id;
    const limit = 5; // Número de atividades a buscar

    // Busca as últimas N atividades (documentos recebidos)
    // (Função corrigida no modelo)
    const activities = await DocumentModel.findRecentActivityByContadorId(contadorId, limit);

    // Formata a resposta
    const formattedActivities = activities.map(act => ({
        id: `doc-${act.id}`,
        oscName: act.from_name, // Nome da OSC que enviou
        type: 'file',
        content: act.original_name,
        timestamp: act.created_at,
    }));
    
    // (Pode adicionar busca e formatação de mensagens recentes aqui também)

    res.status(200).json(formattedActivities);

  } catch (error) {
    console.error('Erro no controlador getRecentActivity:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar atividades recentes.' });
  }
};

/**
 * @desc    Busca notificações (novas mensagens/documentos) para o Contador.
 * @route   GET /api/contador/notifications
 * @access  Privado (Contador)
 */
export const getNotifications = async (req, res) => { // <-- A FUNÇÃO QUE FALTAVA
  try {
    const contadorId = req.user.id;

    // 1. Buscar novas mensagens (ex: 5 últimas não lidas)
    const newMessages = await MessageModel.findRecentUnreadByContadorId(contadorId, 5);
    
    // 2. Buscar novos documentos (ex: 5 últimos)
    // (O modelo usa findRecentUnreadByContadorId, que busca os docs recentes)
    const newDocuments = await DocumentModel.findRecentUnreadByContadorId(contadorId, 5); 

    // 3. Formatar e combinar
    const messageNotifs = newMessages.map(msg => ({
        id: `msg-${msg.id}`,
        oscId: msg.osc_id, // Para navegação
        oscName: msg.from_name, // Nome da OSC
        type: 'message',
        content: msg.text.substring(0, 50) + (msg.text.length > 50 ? '...' : ''),
        timestamp: msg.date,
    }));

    const documentNotifs = newDocuments.map(doc => ({
        id: `doc-${doc.id}`,
        fileId: doc.id, // Para navegação
        oscId: doc.osc_id, // Para navegação
        oscName: doc.from_name, // Nome da OSC
        type: 'file',
        content: doc.original_name,
        timestamp: doc.created_at,
    }));

    // 4. Combinar, ordenar por data e limitar
    const allNotifications = [...messageNotifs, ...documentNotifs]
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 10); // Limita o total de notificações

    res.status(200).json(allNotifications);

  } catch (error) {
    console.error('Erro no controlador getNotifications:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};