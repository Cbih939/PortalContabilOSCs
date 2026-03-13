import { Router } from 'express';
import { 
    getContacts, 
    getMessages, 
    sendMessage, 
    getMessagesByStatus 
} from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas as rotas de mensagens precisam de utilizador logado (protegidas)
router.use(protect);

// 1. Busca os contatos da barra lateral
router.get('/contacts', getContacts);

// 2. Envia uma nova mensagem
router.post('/send', sendMessage);

// 3. Busca o histórico de mensagens (NOVO: suporta ?contactId=3)
router.get('/', getMessages);

// 4. Busca o histórico de mensagens (Suporta formato /3)
router.get('/:id', getMessages);

// Rota para os status de pagamento (mantida para compatibilidade)
router.get('/status/:status', getMessagesByStatus);

export default router;