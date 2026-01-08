import express from 'express';
// Se a função getMyOSCs ainda não estiver no controller, o servidor vai reclamar depois.
// Mas primeiro precisamos que este arquivo exista.
import { getAllOSCs, getOSCById, createOSC, updateOSC, deleteOSC, assignContador, getMyOSCs } from '../controllers/osc.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect);

router.get('/my', getMyOSCs); // Rota crítica para o painel
router.get('/', getAllOSCs);
router.post('/', createOSC);
router.get('/:id', getOSCById);
router.put('/:id', updateOSC);
router.delete('/:id', deleteOSC);
router.post('/:id/assign', assignContador);

export default router;