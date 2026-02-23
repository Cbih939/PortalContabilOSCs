import { Router } from 'express';
import { getAllOffices, createOffice } from '../controllers/office.controller.js';
import { verifyToken } from '../controllers/auth.controller.js';

const router = Router();

// Apenas administradores devem gerir escritórios
router.use(verifyToken);

router.get('/', getAllOffices); // GET /api/admin/offices
router.post('/', createOffice); // POST /api/admin/offices

export default router;