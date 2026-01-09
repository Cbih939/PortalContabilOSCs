import { Router } from 'express';
import { updateUser } from '../controllers/user.controller.js';
// Importamos a função 'protect' do ficheiro que você enviou
import { protect } from '../controllers/auth.controller.js'; 

const router = Router();

// Agora usamos 'protect' como middleware
router.put('/:id', protect, updateUser);

export default router;