// backend/src/controllers/contador.controller.js

// Importa os modelos necessários (precisaremos criar/atualizar as funções neles)
import * as OscModel from '../models/osc.model.js';
import * as DocumentModel from '../models/document.model.js';
import * as MessageModel from '../models/message.model.js';

/**
 * @desc    Busca estatísticas para o Dashboard do Contador.
 * @route   GET /api/contador/dashboard/stats
 * @access  Privado (Contador)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const contadorId = req.user.id; // ID do contador logado

    // 1. Contar OSCs Ativas associadas
    const activeOscCount = await OscModel.countActiveByContadorId(contadorId);

    // 2. Contar Documentos Pendentes (Exemplo: todos os recebidos)
    //    (A definição de 'pendente' pode precisar ser refinada)
    const pendingDocsCount = await DocumentModel.countReceivedByContadorId(contadorId);

    // 3. Contar Mensagens Não Lidas
    //    (Assumindo que a tabela 'messages' tem um campo 'read_status')
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

    // Busca as últimas N atividades (documentos recebidos, mensagens recebidas)
    // O modelo precisará de uma função que combine e ordene estas atividades.
    const activities = await DocumentModel.findRecentActivityByContadorId(contadorId, limit);
    // (No futuro, esta função no modelo combinaria dados de 'documents' e 'messages')

    // Formata a resposta para corresponder ao mock (se necessário)
    const formattedActivities = activities.map(act => ({
        id: `doc-${act.id}`, // Prefixo para diferenciar de mensagens no futuro
        oscName: act.from_name, // Nome da OSC que enviou
        type: 'file', // Tipo da atividade
        content: act.original_name, // Nome do ficheiro
        timestamp: act.created_at, // Data do upload
    }));
    // (Adicionar lógica para buscar e formatar mensagens recentes aqui também)


    res.status(200).json(formattedActivities); // Retorna array formatado

  } catch (error) {
    console.error('Erro no controlador getRecentActivity:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar atividades recentes.' });
  }
};