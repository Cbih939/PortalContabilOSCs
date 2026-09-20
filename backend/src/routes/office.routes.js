// backend/src/routes/office.routes.js
import { Router } from 'express';
import { getOffices, createOffice, updateOffice, deleteOffice } from '../controllers/office.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getOffices);
router.post('/', checkRole('ADMIN'), createOffice);   // somente Administrador
router.put('/:id', updateOffice); // Admin (qualquer) ou ADM Contador (o próprio) — validado no controller
router.delete('/:id', checkRole('ADMIN'), deleteOffice); // somente Administrador

export default router;