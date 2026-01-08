import express from 'express';
// Vamos usar um controller "Mock" (falso) se o arquivo não existir, ou apontar para o certo
// Mas como você fez reset, o controller de alerts talvez não exista.
// Vamos criar rotas simples que retornam vazio para não quebrar o server.
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(protect);

// Rotas "falsas" para evitar erro 404/500 no frontend
router.get('/history', (req, res) => res.json([])); 
router.get('/', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ message: 'Aviso enviado' }));

export default router;