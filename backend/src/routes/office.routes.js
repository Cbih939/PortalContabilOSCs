// backend/src/routes/office.routes.js
import { Router } from 'express';
import { getOffices, createOffice, updateOffice, deleteOffice } from '../controllers/office.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getOffices);
router.post('/', createOffice);
router.put('/:id', updateOffice); // ROTA DE EDIÇÃO
router.delete('/:id', deleteOffice); // ROTA DE EXCLUSÃO

export default router;