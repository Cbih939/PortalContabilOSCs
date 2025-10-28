// backend/src/routes/template.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js'; // Nosso middleware Multer
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  listTemplates,
  uploadTemplate,
  downloadTemplate,
  deleteTemplate
} from '../controllers/template.controller.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/templates --- */

// GET /api/templates
// Lista todos os modelos (para Contador e OSC)
router.get(
  '/',
  protect,
  checkRole([ROLES.CONTADOR, ROLES.OSC]),
  listTemplates
);

// POST /api/templates
// Faz upload de um novo modelo (Apenas Contador)
router.post(
  '/',
  protect,
  checkRole([ROLES.CONTADOR]),
  upload.single('templateFile'), // Espera um campo 'templateFile' no FormData
  uploadTemplate
);

// GET /api/templates/:id/download
// Baixa um modelo específico (Contador e OSC)
router.get(
  '/:id/download',
  protect,
  checkRole([ROLES.CONTADOR, ROLES.OSC]),
  downloadTemplate
);

// DELETE /api/templates/:id
// Apaga um modelo (Apenas Contador)
router.delete(
  '/:id',
  protect,
  checkRole([ROLES.CONTADOR]),
  deleteTemplate
);

// Exporta o router
export default router;