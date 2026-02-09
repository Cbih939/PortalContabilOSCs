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

// Configuração de Caminhos Absolutos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CONFIGURAÇÃO DE CORS
app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'],
  credentials: true
}));

/**
 * 2. ROTA DE WEBHOOK (ANTES DE TUDO)
 * Necessário express.raw para validar assinatura do Stripe
 */
app.use('/api/webhooks', webhookRoutes);

/**
 * 3. SERVIDOR DE ARQUIVOS ESTÁTICOS (UPLOADS)
 * Se o seu server.js está na raiz e a pasta uploads também, 
 * o path.resolve garante que o Node encontre o caminho físico real na VPS.
 */
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// 4. MIDDLEWARES DE PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testar conexão com o Banco
testConnection();

// 5. DEFINIÇÃO DAS ROTAS DA API
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

// Rota de Teste de integridade
app.get('/', (req, res) => {
    res.send('API Portal Contábil a funcionar 🚀');
});

// 6. TRATAMENTO DE ERROS GLOBAL
app.use((err, req, res, next) => {
    console.error('[Global Error]:', err.stack);
    res.status(500).json({ 
        message: 'Algo deu errado no servidor!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`[Server] Backend a rodar na porta ${PORT}`);
    console.log(`[Path] Servindo uploads de: ${path.resolve(__dirname, 'uploads')}`);
});