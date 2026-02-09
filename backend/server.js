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

// CORREÇÃO: Certifique-se que o ficheiro existe em: ./src/routes/webhook.routes.js
import webhookRoutes from './src/routes/webhook.routes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CONFIGURAÇÃO DE CORS
app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'], // Adicionado localhost para facilitar teus testes
  credentials: true
}));

/**
 * 2. ROTA DE WEBHOOK (IMPORTANTE)
 * Esta rota deve vir ANTES do express.json() para que o Stripe 
 * consiga validar a assinatura do corpo bruto (raw body).
 */
app.use('/api/webhooks', webhookRoutes);

// 3. MIDDLEWARES PADRÃO
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de Caminhos para Uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Testar conexão com o Banco
testConnection();

// 4. DEFINIÇÃO DAS ROTAS DA API
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

// 5. TRATAMENTO DE ERROS GLOBAL
app.use((err, req, res, next) => {
    console.error('[Global Error]:', err.stack);
    res.status(500).json({ 
        message: 'Algo deu errado no servidor!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`[Server] Backend a rodar na porta ${PORT}`);
    console.log(`[Webhook] Rota de monitoramento Stripe ativa em /api/webhooks/stripe`);
});