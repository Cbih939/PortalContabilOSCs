// backend/src/middlewares/errorHandler.js

import config from '../config/index.js'; // Para aceder a config.NODE_ENV

/**
 * Middleware Global de Tratamento de Erros.
 *
 * Este middleware é acionado sempre que um erro é passado
 * para 'next(error)' num controlador, ou quando um erro
 * síncrono ocorre.
 *
 * O Express reconhece-o como um middleware de erro
 * devido aos seus 4 argumentos (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  
  // 1. Determina o Código de Status (StatusCode)
  //    Se o 'res' já tiver um statusCode (ex: 400, 401, 404)
  //    definido no controlador, usa-o.
  //    Senão, usa 500 (Erro Interno do Servidor) como padrão.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // 2. Determina a Mensagem de Erro
  let message = err.message || 'Ocorreu um erro inesperado.';

  // (Opcional) Tratamento de erros específicos
  if (err.name === 'ValidationError') { // Ex: Erro de uma biblioteca de validação
    statusCode = 400;
    message = err.message;
  }
  if (err.name === 'CastError') { // Ex: ID inválido do MongoDB (não se aplica a MySQL, mas é um exemplo)
    statusCode = 404;
    message = 'Recurso não encontrado.';
  }
  // (Pode adicionar erros de 'ER_DUP_ENTRY' do MySQL aqui)

  // 3. Resposta de Erro
  //    Envia uma resposta JSON padronizada.
  res.status(statusCode).json({
    message: message,
    
    // 4. Stack Trace (Apenas em Desenvolvimento)
    //    Por segurança, NUNCA exponha a 'stack trace' do erro
    //    em produção.
    stack: config.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * Middleware para "Apanhar" rotas 404.
 *
 * Se uma requisição chegar aqui, significa que nenhuma
 * rota anterior (em 'routes/') correspondeu à URL pedida.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Não encontrado - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passa o erro para o 'errorHandler' global
};

export { errorHandler, notFound };

/**
 * --- Como Usar (Exemplo no 'server.js') ---
 *
 * import express from 'express';
 * import { errorHandler, notFound } from './src/middlewares/errorHandler.js';
 * import allRoutes from './src/routes/index.js';
 *
 * const app = express();
 *
 * // ... (outros middlewares: cors, express.json)
 *
 * // 1. Rotas da API
 * app.use('/api', allRoutes);
 *
 * // 2. Middleware 404 (Apanha o que não foi encontrado)
 * //    (Deve vir DEPOIS das rotas)
 * app.use(notFound);
 *
 * // 3. Middleware de Erro Global (Apanha tudo)
 * //    (Deve ser o ÚLTIMO middleware)
 * app.use(errorHandler);
 *
 * // ... (app.listen)
 */