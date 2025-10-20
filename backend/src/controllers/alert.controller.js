// backend/src/controllers/alert.controller.js

// Importa o modelo que faz a interação direta com o banco de dados.
// (Assumimos que 'alert.model.js' existirá em '../models/')
import * as AlertModel from '../models/alert.model.js';

/**
 * @desc    Busca todos os alertas para a OSC logada.
 * @route   GET /api/alerts
 * @access  Privado (requer login de OSC)
 */
export const getMyAlerts = async (req, res) => {
  try {
    // O 'req.user.id' é injetado pelo middleware de autenticação (JWT).
    // Para um utilizador OSC, req.user.id será o ID da OSC.
    const oscId = req.user.id;

    if (!oscId) {
      // Este erro não deve acontecer se o middleware de 'role' estiver correto
      return res.status(401).json({ message: 'Não autorizado.' });
    }

    const alerts = await AlertModel.findAlertsByOSCId(oscId);
    
    // Retorna os alertas (pode ser um array vazio)
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Erro no controlador ao buscar alertas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar alertas.' });
  }
};

/**
 * @desc    Cria um novo alerta para uma OSC específica.
 * @route   POST /api/alerts
 * @access  Privado (requer login de Contador)
 * @body    { oscId: string, title: string, message: string }
 */
export const createAlert = async (req, res) => {
  try {
    const { oscId, title, message } = req.body;

    // O ID do *remetente* (o Contador) vem do token
    const fromContadorId = req.user.id; 

    // Validação básica de entrada
    if (!oscId || !title || !message) {
      return res.status(400).json({ 
        message: 'Dados inválidos. oscId, title, e message são obrigatórios.' 
      });
    }

    const newAlertData = {
      oscId, // O ID da OSC que *receberá* o alerta
      title,
      message,
      // (Opcional) Podemos salvar quem enviou
      created_by_contador_id: fromContadorId, 
    };

    const createdAlert = await AlertModel.createAlert(newAlertData);

    // Retorna o novo alerta criado com o status 201 (Created)
    res.status(201).json(createdAlert);
  } catch (error) {
    console.error('Erro no controlador ao criar alerta:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar alerta.' });
  }
};

/**
 * @desc    Marca um alerta específico como lido.
 * @route   PATCH /api/alerts/:alertId/read
 * @access  Privado (requer login de OSC)
 */
export const markAsRead = async (req, res) => {
  try {
    // O ID do alerta vem do parâmetro da URL (ex: /api/alerts/123/read)
    const { alertId } = req.params;
    
    // O ID da OSC logada (para garantir que ela só marque os *seus* alertas)
    const oscId = req.user.id;

    if (!alertId) {
      return res.status(400).json({ message: 'ID do alerta não fornecido.' });
    }

    // O modelo deve verificar o alertId E o oscId por segurança
    const updatedAlert = await AlertModel.markAsRead(alertId, oscId);

    if (!updatedAlert) {
      // Se o modelo retornar null/undefined, significa que o alerta
      // não foi encontrado OU não pertencia a esta OSC.
      return res.status(404).json({ 
        message: 'Alerta não encontrado ou não pertence a este utilizador.' 
      });
    }

    // Retorna o alerta atualizado (ou apenas status 204 No Content)
    res.status(200).json(updatedAlert);
  } catch (error) {
    console.error('Erro no controlador ao marcar alerta como lido:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar alerta.' });
  }
};