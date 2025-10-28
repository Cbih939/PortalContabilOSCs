// backend/src/controllers/template.controller.js

import * as TemplateModel from '../models/template.model.js';
import { ROLES } from '../utils/constants.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helper para caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// NOTA: O middleware 'upload.middleware.js' salva tudo em 'backend/uploads/'
// A migração 008 não criou uma pasta separada, então usaremos a pasta de uploads padrão.
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');

/**
 * @desc    Lista todos os ficheiros de modelo disponíveis.
 * @route   GET /api/templates
 * @access  Privado (Contador, OSC)
 */
export const listTemplates = async (req, res) => {
  try {
    const templates = await TemplateModel.findAll();
    res.status(200).json(templates);
  } catch (error) {
    console.error('Erro no controlador listTemplates:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Faz o upload de um novo ficheiro de modelo.
 * @route   POST /api/templates
 * @access  Privado (Contador)
 * @middleware  upload.single('templateFile')
 */
export const uploadTemplate = async (req, res) => {
  try {
    // 1. O middleware 'multer' (configurado na rota) já processou o ficheiro.
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum ficheiro enviado.' });
    }
    
    // 2. O 'req.user' foi injetado pelo middleware de auth.
    const contadorId = req.user.id;
    if (req.user.role !== ROLES.CONTADOR) {
      // Se um não-Contador tentar (embora a rota deva bloquear), apaga o ficheiro
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    // 3. Pega o nome de exibição (ex: "Modelo Financeiro") do corpo do formulário.
    const { file_name } = req.body;
    if (!file_name) {
         fs.unlinkSync(req.file.path);
         return res.status(400).json({ message: 'O nome de exibição (file_name) é obrigatório.' });
    }

    // 4. Prepara os dados para salvar no banco
    const templateData = {
      file_name: file_name, // Nome de exibição
      description: req.file.originalname, // Nome real do ficheiro
      saved_filename: req.file.filename,
      file_path: req.file.path,
      file_size_bytes: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by_contador_id: contadorId,
    };

    // 5. Salva o registo no banco
    const newTemplate = await TemplateModel.create(templateData);

    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Erro no controlador uploadTemplate:', error);
    // Se o 'req.file' existir e algo falhar, apaga o ficheiro órfão
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor ao salvar o modelo.' });
  }
};

/**
 * @desc    Fornece um modelo para download.
 * @route   GET /api/templates/:id/download
 * @access  Privado (Contador, OSC)
 */
export const downloadTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Busca os detalhes do ficheiro no banco
    const template = await TemplateModel.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Modelo não encontrado.' });
    }

    // (Não há verificação de permissão complexa, pois todos logados podem baixar)

    // 2. Constrói o caminho completo (a partir do 'file_path' salvo no DB)
    const filePath = template.file_path; // Usa o caminho absoluto salvo

    // 3. Verifica se o ficheiro ainda existe no disco
    if (!fs.existsSync(filePath)) {
      console.error(`Ficheiro modelo não encontrado no disco: ${filePath} (ID: ${id})`);
      return res.status(404).json({ message: 'Ficheiro não encontrado no servidor.' });
    }

    // 4. Envia o ficheiro para o utilizador
    //    Usa 'template.description' (nome original, ex: "modelo.xlsx") como nome de download
    res.download(filePath, template.description);
    
  } catch (error) {
    console.error('Erro no controlador downloadTemplate:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * @desc    Apaga um ficheiro de modelo (do DB e do disco).
 * @route   DELETE /api/templates/:id
 * @access  Privado (Contador)
 */
export const deleteTemplate = async (req, res) => {
  try {
     const { id } = req.params;

     // 1. Busca os detalhes do ficheiro (precisamos do caminho para apagar)
     const template = await TemplateModel.findById(id);
     if (!template) {
       return res.status(404).json({ message: 'Modelo não encontrado.' });
     }
     
     // 2. Tenta apagar o ficheiro do disco
     const filePath = template.file_path;
     if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
         console.log(`[DeleteTemplate] Ficheiro apagado do disco: ${filePath}`);
     } else {
         console.warn(`[DeleteTemplate] Ficheiro não encontrado no disco (pode já ter sido apagado): ${filePath}`);
     }
     
     // 3. Apaga o registo do banco de dados
     await TemplateModel.deleteById(id);
     
     res.status(200).json({ message: 'Modelo apagado com sucesso.' });

  } catch (error) {
    console.error('Erro no controlador deleteTemplate:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};