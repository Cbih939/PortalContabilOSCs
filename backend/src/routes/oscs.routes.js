// backend/src/routes/oscs.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js'; // (Validação de texto é complexa com multer)
import upload from '../middlewares/upload.middleware.js'; // Importa Multer
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getAllOSCs,
  getMyOSCs,
  getOSCById,
  createOSC,
  updateOSC,
  assignContador,
  deleteOSC,
} from '../controllers/osc.controller.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/oscs --- */

// GET /api/oscs (Admin)
router.get(
  '/',
  protect,
  checkRole([ROLES.ADMIN]),
  getAllOSCs
);

// GET /api/oscs/my (Contador)
router.get(
  '/my',
  protect,
  checkRole([ROLES.CONTADOR]),
  getMyOSCs
);

// GET /api/oscs/:id (Admin, Contador associado, OSC própria)
router.get(
  '/:id',
  protect,
  getOSCById
);

// POST /api/oscs (Criação de OSC - Atualizado para multipart/form-data)
// Define os campos de ficheiro que o Multer deve esperar
const oscUploadFields = [
    { name: 'logotipo', maxCount: 1 },
    { name: 'ata', maxCount: 1 },
    { name: 'estatuto', maxCount: 1 }
];

router.post(
  '/',
  protect,
  checkRole([ROLES.ADMIN, ROLES.CONTADOR]),
  upload.fields(oscUploadFields), // <-- USA MULTER para processar ficheiros
  // Nota: A validação (express-validator) em campos de texto de multipart/form-data é complexa
  // e geralmente é feita manualmente no controlador.
  createOSC // Controlador
);

// PUT /api/oscs/:id (Atualiza OSC)
router.put(
  '/:id',
  protect,
  // (Pode precisar de upload.fields aqui também se a edição permitir mudar ficheiros)
  updateOSC
);

// PATCH /api/oscs/:id/assign (Admin)
router.patch(
  '/:id/assign',
  protect,
  checkRole([ROLES.ADMIN]),
  assignContador
);

// DELETE /api/oscs/:id (Admin)
router.delete(
  '/:id',
  protect,
  checkRole([ROLES.ADMIN]),
  deleteOSC
);

// Exporta o router
export default router;