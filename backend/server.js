import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './src/config/db.js';

// --- IMPORTAÇÃO DAS ROTAS ---
import adminRoutes from './src/routes/admin.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import contadorRoutes from './src/routes/contador.routes.js';
import userRoutes from './src/routes/user.routes.js';
import oscRoutes from './src/routes/osc.routes.js';
import docRoutes from './src/routes/doc.routes.js';
import templateRoutes from './src/routes/template.routes.js';
import noticeRoutes from './src/routes/notice.routes.js';
import messageRoutes from './src/routes/message.routes.js';
import publicFileRoutes from './src/routes/publicFile.routes.js';
import alertRoutes from './src/routes/alert.routes.js';
import webhookRoutes from './src/routes/webhook.routes.js'; 
import officeRoutes from './src/routes/office.routes.js';
import { startGovernanceCron } from './src/services/governance.service.js';
import projectRoutes from './src/routes/project.routes.js';
import systemRoutes from './src/routes/system.routes.js';
import certificateRoutes from './src/routes/certificate.routes.js';

// 🚀 NOVA ROTA DA DIRETORIA AQUI!
import boardRoutes from './src/routes/board.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração para suportar ES Modules (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIGURAÇÃO DE SEGURANÇA E CORS ---
app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'],
  credentials: true
}));

// --- 2. SERVIDOR DE FICHEIROS ESTÁTICOS (RESOLUÇÃO DE ERRO 404) ---
/**
 * Definimos caminhos absolutos para garantir que a VPS encontre os ficheiros.
 * O cabeçalho 'inline' permite abrir PDFs e Imagens diretamente no browser.
 */
const staticOptions = {
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
    res.set('Content-Disposition', 'inline');
  }
};

// Caminhos físicos absolutos na VPS
const uploadsPath = path.resolve(__dirname, 'uploads');
const publicUploadsPath = path.resolve(uploadsPath, 'public');

// Mapeamento prioritário: primeiro a subpasta 'public' (imagens da biblioteca)
app.use('/uploads/public', express.static(publicUploadsPath, staticOptions));

// Mapeamento secundário: pasta raiz 'uploads' (documentos das OSCs)
app.use('/uploads', express.static(uploadsPath, staticOptions));


// --- 3. MIDDLEWARES DE PROCESSAMENTO ---
// Webhooks devem vir antes do express.json() se precisarem de raw body
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 4. CONEXÃO COM O BANCO DE DADOS ---
testConnection();

// --- 5. DEFINIÇÃO DAS ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/contador', contadorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/oscs', oscRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/public-files', publicFileRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/certificates', certificateRoutes);

// 🚀 REGISTO DA NOVA ROTA DA DIRETORIA AQUI!
app.use('/api/board', boardRoutes);


// Rota de teste de saúde da API
app.get('/', (req, res) => {
  res.send('API Portal Contábil Ativa e Operacional 🚀');
});

// --- 6. TRATAMENTO DE ERROS GLOBAL ---
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);
  res.status(500).json({ 
    message: 'Ocorreu um erro interno no servidor!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- 7. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  startGovernanceCron();
  console.log(`\n=========================================`);
  console.log(`🚀 Servidor rodando na porta: ${PORT}`);
  console.log(`📁 Pasta Uploads: ${uploadsPath}`);
  console.log(`🖼️  Pasta Public: ${publicUploadsPath}`);
  console.log(`=========================================\n`); 
});