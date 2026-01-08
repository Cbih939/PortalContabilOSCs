import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurações
import pool, { testConnection } from './src/config/db.js';

// Rotas
import authRoutes from './src/routes/auth.routes.js';
import contadorRoutes from './src/routes/contador.routes.js';
import userRoutes from './src/routes/user.routes.js';
// Adicione outras rotas conforme necessário (docRoutes, etc.)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Testar Banco de Dados
testConnection();

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/contador', contadorRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/docs', docRoutes); 

// Rota raiz de teste
app.get('/', (req, res) => {
    res.send('API Portal Contábil a funcionar 🚀');
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado no servidor!');
});

app.listen(PORT, () => {
    console.log(`[Server] Backend a rodar na porta ${PORT}`);
});