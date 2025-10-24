// backend/src/controllers/doc.controller.js

import * as DocumentModel from '../models/document.model.js';
import * as OscModel from '../models/osc.model.js';
import { ROLES } from '../utils/constants.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helper para caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const TEMPLATES_DIR = path.resolve(__dirname, '..', '..', 'public', 'templates');


/**
 * @desc    Busca documentos recebidos pelo Contador logado.
 * @route   GET /api/documents/received
 * @access  Privado (Contador)
 */
export const getReceivedDocuments = async (req, res) => {
  try {
    const contadorId = req.user.id;
    if (req.user.role !== ROLES.CONTADOR) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const documents = await DocumentModel.findDocsByContadorId(contadorId);
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erro no controlador getReceivedDocuments:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Busca documentos (enviados/recebidos) da OSC logada.
 * @route   GET /api/documents/my
 * @access  Privado (OSC)
 */
export const getMyDocuments = async (req, res) => {
  try {
    const oscId = req.user.id;
    if (req.user.role !== ROLES.OSC) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }
    const documents = await DocumentModel.findDocsByOscId(oscId);
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erro no controlador getMyDocuments:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Recebe um upload de documento de uma OSC.
 * @route   POST /api/documents/upload
 * @access  Privado (OSC)
 * @middleware  upload.single('file')
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });
    }

    const oscId = req.user.id;
    const oscName = req.user.name;

    if (req.user.role !== ROLES.OSC) {
      fs.unlinkSync(req.file.path); // Apaga ficheiro órfão
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // Busca o contador associado a esta OSC
    const contador = await OscModel.findContadorForOsc(oscId);
    if (!contador) {
      fs.unlinkSync(req.file.path); // Apaga ficheiro órfão
      return res.status(400).json({ message: 'OSC não está associada a nenhum contador.' });
    }

    // --- CORREÇÃO AQUI ---
    // Prepara os dados com os nomes de chave corretos que o modelo espera
    const docData = {
      original_name: req.file.originalname,
      saved_filename: req.file.filename,
      file_path: req.file.path,
      file_size_bytes: req.file.size, // Corrigido de 'file_size'
      mime_type: req.file.mimetype,
      
      // Associações
      osc_id: oscId, // Corrigido de 'from_osc_id' (ID da OSC dona do doc)
      uploaded_by_user_id: oscId, // Adicionado (ID de quem fez upload)
      to_contador_id: contador.id, // ID do destinatário
      
      // Campos do protótipo (para frontend fácil)
      from_name: oscName,
      to_name: ROLES.CONTADOR,
    };
    // --- FIM DA CORREÇÃO ---

    // Salva o registo do ficheiro no banco
    const newDocument = await DocumentModel.createDocumentRecord(docData);

    // Retorna o registo formatado
    res.status(201).json({
        id: newDocument.id,
        name: newDocument.original_name, // Nome que o frontend espera
        date: newDocument.created_at, // Data que o frontend espera
        type: 'sent', // Ponto de vista da OSC
        from: newDocument.from_name,
        to: newDocument.to_name
    });

  } catch (error) {
    console.error('Erro no controlador uploadDocument:', error);
    if (req.file && req.file.path) {
      // Tenta apagar ficheiro órfão se o save no DB falhar
      if (fs.existsSync(req.file.path)) {
           fs.unlinkSync(req.file.path);
      }
    }
    res.status(500).json({ message: 'Erro interno do servidor ao salvar o ficheiro.' });
  }
};

/**
 * @desc    Fornece um documento para download.
 * @route   GET /api/documents/download/:fileId
 * @access  Privado (Contador ou OSC autorizada)
 */
export const downloadDocument = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const doc = await DocumentModel.findDocById(fileId);
    if (!doc) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    // Validação de Permissão
    const hasPermission = await DocumentModel.checkPermission(fileId, userId, userRole);
    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado a este ficheiro.' });
    }

    // Caminho completo (usando 'saved_filename' do DB)
    const filePath = path.join(UPLOADS_DIR, doc.saved_filename);

    if (!fs.existsSync(filePath)) {
      console.error(`Ficheiro não encontrado no disco: ${filePath} (ID: ${fileId})`);
      return res.status(404).json({ message: 'Ficheiro não encontrado no servidor.' });
    }

    // Envia o ficheiro para download usando o nome original
    res.download(filePath, doc.original_name);
    
  } catch (error) {
    console.error('Erro no controlador downloadDocument:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Fornece um template (modelo) para download.
 * @route   GET /api/templates/:templateName
 * @access  Privado
 */
export const downloadTemplate = async (req, res) => {
  try {
    const { templateName } = req.params;
    if (templateName.includes('..') || templateName.includes('/') || templateName.includes('\\')) {
      return res.status(400).json({ message: 'Nome de ficheiro inválido.' });
    }
    const allowedTemplates = ['modelo_financeiro.xlsx']; // Whitelist
    if (!allowedTemplates.includes(templateName)) {
      return res.status(403).json({ message: 'Template não permitido.' });
    }

    const filePath = path.join(TEMPLATES_DIR, templateName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }
    res.download(filePath, templateName);

  } catch (error) {
    console.error('Erro no controlador downloadTemplate:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};