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

// 2. Envia uma nova mensagem (A ROTA QUE ESTAVA FALTANDO!)
router.post('/send', sendMessage);

// 3. Busca o histórico de mensagens com um contato específico (ex: /api/messages/5)
router.get('/:id', getMessages);

// Rota para os status de pagamento (mantida para compatibilidade)
router.get('/status/:status', getMessagesByStatus);

export default router;