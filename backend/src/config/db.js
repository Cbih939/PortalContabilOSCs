import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'portal_contabil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão silencioso para não poluir logs, mas funcional
pool.getConnection()
  .then(connection => {
    console.log('[DB] Conectado com sucesso ao MySQL!');
    connection.release();
  })
  .catch(err => {
    console.error('[DB] Erro fatal de conexão:', err.code, err.message);
  });

export default pool;