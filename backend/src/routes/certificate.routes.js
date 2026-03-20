import express from 'express';
import { getLinks, createLink, deleteLink } from '../controllers/certificate.controller.js';
import { protect, checkRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Contador e Admin gerem os links. OSCs apenas lêem (getLinks será adaptado para ler)
router.get('/', protect, getLinks);
router.post('/', protect, checkRole(['contador', 'admin']), createLink);
router.delete('/:id', protect, checkRole(['contador', 'admin']), deleteLink);

export default router;