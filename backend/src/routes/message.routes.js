import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Listar contatos para a barra lateral
router.get('/contacts', protect, messageController.getContacts);

// Obter histórico de mensagens (Suporta /?contactId=X ou /:id)
router.get('/', protect, messageController.getMessages);
router.get('/:id', protect, messageController.getMessages);

// Enviar mensagem
router.post('/', protect, messageController.sendMessage);

export default router;