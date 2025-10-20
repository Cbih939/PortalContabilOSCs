// backend/server.js

import express from 'express';
import cors from 'cors';
import path from 'path'; // Para servir ficheiros estáticos
import { fileURLToPath } from 'url';

// 1. Importa a configuração (que já carrega o .env)
import config from './src/config/index.js';

// 2. Importa a conexão com o banco e a função de teste
import pool, { testConnection } from './src/config/db.js';

// 3. Importa o roteador principal da API
import apiRoutes from './src/routes/index.js';

// 4. Importa os middlewares de erro
import { notFound, errorHandler } from './src/middlewares/errorHandler.js';

// --- Configuração Inicial ---
const app = express();
const PORT = config.PORT || 5000;

// Helper para obter __dirname no modo ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares Essenciais ---

// 5. CORS (Cross-Origin Resource Sharing)
//    Permite que o seu frontend (ex: http://localhost:5173)
//    faça requisições para este backend (ex: http://localhost:5000).
//    Em produção, configure 'origin' para o URL do seu frontend.
app.use(cors({
  // origin: 'http://seu-frontend.com' // Exemplo para produção
}));

// 6. Parser para JSON
//    Permite que o Express entenda o corpo das requisições com 'Content-Type: application/json'.
app.use(express.json());

// 7. Parser para dados de formulário (URL-encoded)
//    Útil se você tiver formulários HTML tradicionais (menos comum com React).
app.use(express.urlencoded({ extended: true }));

// --- Servir Ficheiros Estáticos (Uploads e Templates) ---

// 8. Torna a pasta 'uploads' acessível publicamente
//    Ex: http://localhost:5000/uploads/nome-ficheiro.pdf
//    (!! CUIDADO !!: Em produção, considere usar um serviço de
//     armazenamento dedicado (S3, etc.) ou proteger esta rota)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 9. Torna a pasta 'public/templates' acessível
//    Ex: http://localhost:5000/templates/modelo.xlsx
app.use('/templates', express.static(path.join(__dirname, 'public', 'templates')));


// --- Rotas da API ---

// 10. Monta todas as rotas definidas em 'src/routes/index.js'
//     sob o prefixo '/api'.
//     Ex: /api/auth/login, /api/oscs, /api/documents/upload
app.use('/api', apiRoutes);

// --- Tratamento de Erros ---

// 11. Middleware 404 (Não Encontrado)
//     Deve vir *depois* das rotas da API.
app.use(notFound);

// 12. Middleware Global de Erros
//     Deve ser o *último* middleware adicionado.
app.use(errorHandler);

// --- Iniciar o Servidor ---

// 13. Função assíncrona para permitir o 'await' na conexão do banco
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados antes de iniciar
    await testConnection();

    // Inicia o servidor Express
    app.listen(PORT, () => {
      console.log(`[Server] Backend a rodar em modo '${config.NODE_ENV}' na porta ${PORT}`);
      console.log(`[Server] Acesso à API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    // Se a conexão com o banco falhar, o 'testConnection' já
    // deu console.error e chamou process.exit(1).
    // Este catch é uma segurança extra.
    console.error('[Server] Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Inicia o processo
startServer();