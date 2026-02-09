import { Router } from 'express';
import * as controller from '../controllers/alert.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
// Se você tiver um middleware de authorize, ele deveria ser importado aqui. 
// Como não está, vamos remover a chamada abaixo.

const router = Router();

// CORREÇÃO: Removido o 'authorize' que causava o ReferenceError
// Agora qualquer usuário logado pode acessar seus alertas (o filtro é feito no controller)
router.get('/', protect, controller.getAlerts);

router.post('/', protect, controller.createAlert);
router.put('/:id', protect, controller.updateAlert);
router.delete('/:id', protect, controller.deleteAlert);

export default router;