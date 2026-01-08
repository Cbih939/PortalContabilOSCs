import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
    getNoticeHistory, 
    sendNotice, 
    getNoticeStats 
} from '../controllers/notice.controller.js';

const router = Router();

router.use(protect);

// Rota chamada pelo frontend: /api/notices/history
router.get('/history', getNoticeHistory);

// Rota para enviar aviso (POST /api/notices)
router.post('/', sendNotice);

// Rota de estatísticas (caso precise)
router.get('/stats', getNoticeStats);

export default router;