import express from 'express';
// Importa as funções com os nomes EXATOS que definimos no controller acima
import { sendMessage, getMessagesHistory, getChatContacts } from '../controllers/msg.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplica proteção de login em todas as rotas
router.use(protect);

// Rota para buscar contatos (Chat)
router.get('/contacts', getChatContacts);

// Rota para enviar mensagem
router.post('/', sendMessage);

// Rota para pegar histórico com um usuário específico
router.get('/:otherUserId', getMessagesHistory);

export default router;