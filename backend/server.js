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
import boardRoutes from './src/routes/board.routes.js';
import certificateRoutes from './src/routes/certificate.routes.js';

// 🚀 NOVA ROTA DE LOGS / AUDITORIA AQUI!
import logRoutes from './src/routes/log.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import planRoutes from './src/routes/plan.routes.js';
import financeiroRoutes from './src/routes/financeiro.routes.js';
import transactionRoutes from './src/routes/transaction.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Atrás do nginx/PM2: necessário para req.ip (rate limit) e req.protocol corretos.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// --- 1. CONFIGURAÇÃO DE SEGURANÇA E CORS ---
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'],
  credentials: true
}));

// --- 2. SERVIDOR DE FICHEIROS ESTÁTICOS ---
// Somente uploads/public é servido de forma aberta (logotipos, biblioteca e modelos institucionais).
// Os documentos contábeis (raiz de uploads/) NÃO são mais públicos: o acesso é feito por
// GET /api/documents/download/:id, que valida login e vínculo com a OSC.
const INLINE_SAFE = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);

const staticOptions = {
  dotfiles: 'deny',
  index: false,
  setHeaders: (res, filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') res.set('Content-Type', 'application/pdf');
    // Tipos que o navegador poderia executar/renderizar de forma ativa são sempre baixados.
    res.set('Content-Disposition', INLINE_SAFE.has(ext) ? 'inline' : 'attachment');
  }
};

const uploadsPath = path.resolve(__dirname, 'uploads');
const publicUploadsPath = path.resolve(uploadsPath, 'public');

app.use('/api/uploads/public', express.static(publicUploadsPath, staticOptions));
app.use('/uploads/public', express.static(publicUploadsPath, staticOptions));

// --- 3. MIDDLEWARES DE PROCESSAMENTO ---
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
app.use('/api/board', boardRoutes);
app.use('/api/certificates', certificateRoutes);

// 🚀 REGISTO DA ROTA DE LOGS NO SERVIDOR!
app.use('/api/logs', logRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('API Portal Contábil Ativa e Operacional 🚀');
});

// --- 6. TRATAMENTO DE ERROS GLOBAL ---
app.use((err, req, res, next) => {
  // Erros de upload (multer) são falhas do cliente, não do servidor.
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Arquivo muito grande. O tamanho máximo é de 50 MB.' });
  }
  if (err?.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: err.message });
  }
  if (err?.name === 'MulterError') {
    return res.status(400).json({ message: 'Falha no envio do arquivo. Verifique o formato e tente novamente.' });
  }

  console.error('[Global Server Error]:', err.stack);
  res.status(500).json({ 
    message: 'Ocorreu um erro interno no servidor!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- 7. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  startGovernanceCron();
  console.log(`🚀 Servidor rodando na porta: ${PORT}`);
});