// backend/src/routes/board.routes.js
import { Router } from 'express';
import { getBoardMembers, createBoardMember, updateBoardMember, deleteBoardMember } from '../controllers/board.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect); // Apenas OSCs logadas podem aceder

router.get('/', getBoardMembers);
router.post('/', createBoardMember);
router.put('/:id', updateBoardMember);
router.delete('/:id', deleteBoardMember);

export default router;