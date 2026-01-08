import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getContacts, getMessages, sendMessage } from '../controllers/message.controller.js';

const router = Router();

router.use(protect);

// Rota que corrige o erro 404: /api/messages/contacts
router.get('/contacts', getContacts);

// Obter histórico com um contato específico
router.get('/:contactId', getMessages);

// Enviar mensagem
router.post('/', sendMessage);

export default router;