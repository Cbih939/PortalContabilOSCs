// backend/src/config/index.js

import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do ficheiro .env
// O 'path' é relativo à raiz do *processo* (onde o 'node server.js' é executado),
// por isso apontamos para a raiz do 'backend'.
dotenv.config({ path: '.env' });

/**
 * Objeto de configuração que lê as variáveis de ambiente.
 * Fornece valores padrão para o caso de não serem definidos.
 */
const config = {
  // Configuração do Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000, // Porta para a API (ex: 5000)

  // Configuração do Banco de Dados MySQL
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306, // Porta padrão do MySQL
  DB_USER: process.env.DB_USER || 'Lucas',
  DB_PASSWORD: process.env.DB_PASSWORD || 'PortalLucas54321!', // Coloque a sua senha no .env
  DB_NAME: process.env.DB_NAME || 'portal_contabil',

  // Configuração de Segurança (JWT - JSON Web Token)
  JWT_SECRET: process.env.JWT_SECRET || 'ea000d1a6824d253f61525ba1d69bd29',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

export default config;