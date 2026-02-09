import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './src/config/db.js';

// Importação das Rotas
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURAÇÃO DE SEGURANÇA E CORS ---
app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'],
  credentials: true
}));

// --- SERVIDOR DE FICHEIROS ESTÁTICOS (CONFIGURAÇÃO PRIORITÁRIA) ---
/**
 * Configuramos os caminhos absolutos para evitar erro 404 na VPS.
 * 'Content-Disposition: inline' permite que o navegador abra PDFs/Imagens em vez de baixar.
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

// Caminhos Absolutos na VPS
const uploadsPath = path.resolve(__dirname, 'uploads');
const publicUploadsPath = path.resolve(uploadsPath, 'public');

// 1. Servir a subpasta public primeiro (Prioridade para imagens da biblioteca)
app.use('/uploads/public', express.static(publicUploadsPath, staticOptions));

// 2. Servir a pasta de uploads geral
app.use('/uploads', express.static(uploadsPath, staticOptions));

// --- ROTA DE WEBHOOK (DEVE VIR ANTES DO BODY PARSER JSON) ---
app.use('/api/webhooks', webhookRoutes);

// --- MIDDLEWARES DE PARSER ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testar conexão com o Banco
testConnection();

// --- DEFINIÇÃO DAS ROTAS DA API ---
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

// Rota de Boas-vindas/Saúde do Sistema
app.get('/', (req, res) => res.send('API Portal Contábil Ativa 🚀'));

// --- TRATAMENTO DE ERROS GLOBAL ---
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({ 
    message: 'Algo deu errado no servidor!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// --- INICIALIZAÇÃO ---
app.listen(PORT, () => {
  console.log(`[Server] Rodando na porta ${PORT}`);
  console.log(`[Static] Pasta Geral: ${uploadsPath}`);
  console.log(`[Static] Pasta Pública: ${publicUploadsPath}`);
});