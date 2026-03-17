import { Router } from 'express';
import { getBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember } from '../controllers/board.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Protege a rota: Apenas utilizadores logados acedem
router.use(protect); 

// As 4 rotas fundamentais
router.get('/', getBoardMembers);
router.post('/', createBoardMember);
router.put('/:id', updateBoardMember);
router.delete('/:id', deleteBoardMember);

export default router;