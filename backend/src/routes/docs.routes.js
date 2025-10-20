// backend/src/routes/docs.routes.js

import express from 'express';
// Middlewares
import { protect, checkRole } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js'; // Configuração do Multer
// Constantes
import { ROLES } from '../utils/constants.js';
// Controladores
import {
  getReceivedDocuments,
  getMyDocuments,
  uploadDocument,
  downloadDocument,
  downloadTemplate,
} from '../controllers/doc.controller.js';

// Cria o router
const router = express.Router();

/* --- Definição das Rotas para /api/documents --- */

// GET /api/documents/received
// Busca documentos recebidos pelo Contador.
// Acesso: Apenas Contadores autenticados.
router.get(
  '/received',
  protect, // 1º: Autenticação
  checkRole([ROLES.CONTADOR]), // 2º: Autorização (Contador)
  getReceivedDocuments // 3º: Controlador
);

// GET /api/documents/my
// Busca documentos (enviados/recebidos) da OSC logada.
// Acesso: Apenas OSCs autenticadas.
router.get(
  '/my',
  protect, // 1º: Autenticação
  checkRole([ROLES.OSC]), // 2º: Autorização (OSC)
  getMyDocuments // 3º: Controlador
);

// POST /api/documents/upload
// Rota para a OSC fazer upload de um documento.
// Acesso: Apenas OSCs autenticadas.
router.post(
  '/upload',
  protect, // 1º: Autenticação
  checkRole([ROLES.OSC]), // 2º: Autorização (OSC)
  upload.single('file'), // 3º: Middleware Multer (processa o ficheiro no campo 'file')
  uploadDocument // 4º: Controlador (recebe req.file e req.user)
);

// GET /api/documents/download/:fileId
// Rota para fazer download de um documento específico.
// Acesso: Qualquer utilizador autenticado (Contador ou OSC),
// mas o *controlador* verificará a permissão específica.
router.get(
  '/download/:fileId',
  protect, // 1º: Autenticação (precisa saber quem está a pedir)
  downloadDocument // 2º: Controlador (verifica permissão e envia o ficheiro)
);

// GET /api/templates/:templateName
// Rota para fazer download de ficheiros de template (modelos).
// Acesso: Qualquer utilizador autenticado (Contador ou OSC).
router.get(
  '/templates/:templateName',
  protect, // 1º: Autenticação
  downloadTemplate // 2º: Controlador (verifica nome e envia o ficheiro)
);

// Exporta o router
export default router;