import express from 'express';
import { getChartData } from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Route that provides the chart statistics
router.get('/charts', verifyToken, getChartData);

export default router;
