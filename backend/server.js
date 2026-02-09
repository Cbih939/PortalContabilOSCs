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

// 1. CONFIGURAÇÃO DE CORS
app.use(cors({
  origin: ['https://contacomigo.org.br', 'http://localhost:5173'],
  credentials: true
}));

// 2. WEBHOOK (DEVE VIR ANTES DO JSON PARSER)
app.use('/api/webhooks', webhookRoutes);

// 3. MIDDLEWARES PADRÃO
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 4. CONFIGURAÇÃO DA PASTA DE UPLOADS (CAMINHO ABSOLUTO VPS)
 * Esta configuração permite que o navegador acesse os ficheiros diretamente via URL
 */
const uploadsPath = '/var/www/PortalContabilOSCs/backend/uploads';

app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        // 'inline' permite visualizar no navegador em vez de forçar download imediato
        res.set('Content-Disposition', 'inline');
    }
}));

// Testar conexão com o Banco
testConnection();

// 5. DEFINIÇÃO DAS ROTAS
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

app.get('/', (req, res) => {
    res.send('API Portal Contábil a funcionar 🚀');
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('[Server Error]:', err.stack);
    res.status(500).json({ message: 'Erro interno no servidor' });
});

app.listen(PORT, () => {
    console.log(`[Server] Backend a rodar na porta ${PORT}`);
    console.log(`[Static] Servindo ficheiros de: ${uploadsPath}`);
});