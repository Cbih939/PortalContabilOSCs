// backend/src/controllers/doc.controller.js

// (Assumimos que estes ficheiros existirão em '../models/' e '../utils/')
import * as DocumentModel from '../models/document.model.js';
import * as OscModel from '../models/osc.model.js'; // (Necessário para encontrar o contador)
import { ROLES } from '../utils/constants.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helper para obter o __dirname no modo ES Modules
// (process.cwd() pode ser mais robusto dependendo de onde o script é iniciado)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define o caminho base para os diretórios
// (de 'src/controllers' volta 2 níveis para 'backend/')
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');
const TEMPLATES_DIR = path.resolve(__dirname, '..', '..', 'public', 'templates');


/**
 * @desc    Busca documentos recebidos pelo Contador logado.
 * @route   GET /api/documents/received
 * @access  Privado (Contador)
 */
export const getReceivedDocuments = async (req, res) => {
  try {
    const contadorId = req.user.id; // Injetado pelo middleware de auth

    // Verifica se o utilizador é um Contador (embora a rota já deva estar protegida)
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
    const oscId = req.user.id; // Injetado pelo middleware de auth

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
 * @middleware  upload.single('file') (Isto deve ser adicionado na Rota!)
 */
export const uploadDocument = async (req, res) => {
  try {
    // 1. O middleware 'multer' (que será configurado na rota)
    //    já processou o ficheiro e o colocou em 'req.file'.
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });
    }
    
    // 2. O 'req.user' foi injetado pelo middleware de auth.
    const oscId = req.user.id;
    const oscName = req.user.name; // O 'from_name' do seu mock
    
    if (req.user.role !== ROLES.OSC) {
      // Se um não-OSC tentar usar esta rota
      // (Apaga o ficheiro que o multer possa ter salvo)
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 3. (Lógica de Negócio) Encontra a quem este documento se destina.
    //    (Assumindo que uma OSC só tem UM contador)
    const contador = await OscModel.findContadorForOsc(oscId);
    if (!contador) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'OSC não está associada a nenhum contador.' });
    }

    // 4. Prepara os dados para salvar no banco
    const docData = {
      original_name: req.file.originalname,
      saved_filename: req.file.filename, // Nome salvo pelo multer (ex: 12345-file.pdf)
      file_path: req.file.path, // Caminho completo no servidor
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      
      // Associações (baseado no protótipo)
      from_name: oscName, // "OSC Esperança"
      to_name: ROLES.CONTADOR, // "Contador"
      
      // Associações (baseado em IDs - Modelo de dados melhor)
      from_osc_id: oscId,
      to_contador_id: contador.id,
    };

    // 5. Salva o registo do ficheiro no banco de dados
    const newDocument = await DocumentModel.createDocumentRecord(docData);

    res.status(201).json(newDocument);
  } catch (error) {
    console.error('Erro no controlador uploadDocument:', error);
    // Se o 'req.file' existir e algo falhar, apaga o ficheiro órfão
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
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

    // 1. Busca os detalhes do ficheiro no banco
    const doc = await DocumentModel.findDocById(fileId);
    if (!doc) {
      return res.status(404).json({ message: 'Documento não encontrado.' });
    }

    // 2. Validação de Permissão (CRÍTICO)
    // O utilizador logado tem permissão para aceder a este ficheiro?
    const hasPermission = await DocumentModel.checkPermission(fileId, userId, userRole);
    
    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para ver este ficheiro.' });
    }

    // 3. Constrói o caminho completo do ficheiro no servidor
    //    (Assume que 'doc.saved_filename' está no banco)
    const filePath = path.join(UPLOADS_DIR, doc.saved_filename);

    // 4. Verifica se o ficheiro ainda existe no disco
    if (!fs.existsSync(filePath)) {
      console.error(`Ficheiro não encontrado no disco: ${filePath} (ID: ${fileId})`);
      return res.status(404).json({ message: 'Ficheiro não encontrado no servidor. Contacte o suporte.' });
    }

    // 5. Envia o ficheiro para o utilizador
    //    'res.download' trata de definir os cabeçalhos corretos
    //    (como 'Content-Disposition') usando o 'original_name'.
    res.download(filePath, doc.original_name);
    
  } catch (error) {
    console.error('Erro no controlador downloadDocument:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Fornece um template (modelo) para download.
 * @route   GET /api/templates/:templateName
 * @access  Privado (Assumindo que OSCs/Contadores podem baixar)
 */
export const downloadTemplate = async (req, res) => {
  try {
    const { templateName } = req.params;

    // 1. Segurança: Previne Path Traversal (../)
    //    (Verifica se o nome contém caracteres inválidos)
    if (templateName.includes('..') || templateName.includes('/') || templateName.includes('\\')) {
      return res.status(400).json({ message: 'Nome de ficheiro inválido.' });
    }
    
    // (Opcional, mas recomendado: Whitelist de templates)
    const allowedTemplates = ['modelo_financeiro.xlsx'];
    if (!allowedTemplates.includes(templateName)) {
      return res.status(403).json({ message: 'Template não permitido.' });
    }

    // 2. Constrói o caminho
    const filePath = path.join(TEMPLATES_DIR, templateName);

    // 3. Verifica se existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Template não encontrado.' });
    }

    // 4. Envia o ficheiro
    res.download(filePath, templateName);

  } catch (error) {
    console.error('Erro no controlador downloadTemplate:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};