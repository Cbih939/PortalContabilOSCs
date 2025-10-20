// backend/src/middlewares/upload.middleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Configuração de Caminhos ---
// (Igual ao 'doc.controller.js')
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Caminho para a pasta 'uploads/' na raiz do 'backend/'
const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');

// 1. Garante que o diretório 'uploads/' existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`[Multer] Diretório de uploads criado em: ${UPLOADS_DIR}`);
}

// 2. Tipos de ficheiros permitidos (baseado no protótipo)
const allowedMimeTypes = [
  // Documentos
  'application/pdf', // .pdf
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  
  // (Adicionando imagens, como no 'DocumentUpload.js' do frontend)
  'image/jpeg', // .jpeg, .jpg
  'image/png', // .png
];

// 3. Configuração do Storage (Onde e como guardar)
const storage = multer.diskStorage({
  /**
   * Define o diretório de destino.
   */
  destination: (req, file, cb) => {
    // 'cb' é um "callback" (callback(erro, destino))
    cb(null, UPLOADS_DIR);
  },
  
  /**
   * Define o nome do ficheiro.
   * Criamos um nome único para evitar que ficheiros com
   * o mesmo nome (ex: 'balancete.pdf') se substituam.
   */
  filename: (req, file, cb) => {
    // Pega a extensão do ficheiro (ex: ".pdf")
    const ext = path.extname(file.originalname);
    // Pega o nome base (ex: "balancete")
    const basename = path.basename(file.originalname, ext);
    
    // Formato: NOME_BASE-TIMESTAMP.EXT
    // Ex: balancete-1678886400000.pdf
    const uniqueSuffix = Date.now();
    const finalFilename = `${basename}-${uniqueSuffix}${ext}`;
    
    cb(null, finalFilename);
  },
});

// 4. Configuração do Filtro (O que aceitar)
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    // Tipo de ficheiro permitido
    cb(null, true);
  } else {
    // Tipo de ficheiro rejeitado
    // 'cb(new Error(...))' passa um erro para o errorHandler
    cb(new Error('Tipo de ficheiro inválido. Apenas PDF, DOCX, XLSX, XLS, JPG ou PNG são permitidos.'), false);
  }
};

// 5. Cria e exporta a instância do Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // Limite de 10 MB por ficheiro
  },
});

export default upload;

/**
 * --- Como Usar (Exemplo num ficheiro de rotas) ---
 *
 * import express from 'express';
 * import upload from '../middlewares/upload.middleware.js';
 * import { protect } from '../middlewares/auth.middleware.js';
 * import { uploadDocument } from '../controllers/doc.controller.js';
 *
 * const router = express.Router();
 *
 * // Esta rota irá:
 * // 1. Verificar o token (protect)
 * // 2. Processar UM ficheiro no campo 'file' (upload.single('file'))
 * // 3. Se o filtro passar, o ficheiro é salvo no disco.
 * // 4. O 'req.file' é anexado.
 * // 5. O 'uploadDocument' (controlador) é executado.
 * router.post(
 * '/documents/upload',
 * protect,
 * upload.single('file'), // 'file' é o nome do campo no FormData do frontend
 * uploadDocument
 * );
 *
 * export default router;
 */