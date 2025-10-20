// backend/src/config/db.js

import mysql from 'mysql2/promise'; // Usa a versão com 'Promise' (para async/await)
import config from './index.js'; // Importa as nossas variáveis de ambiente

/**
 * Criação do Pool de Conexões MySQL.
 *
 * Um "pool" gere múltiplas conexões. Quando a sua API precisa
 * de falar com o banco, ela "pega emprestada" uma conexão do pool
 * e a "devolve" quando termina. Isso é muito mais rápido e
 * eficiente do que abrir e fechar uma conexão a cada vez.
 */
const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  
  // Limites do Pool
  waitForConnections: true, // Espera se todas as conexões estiverem em uso
  connectionLimit: 10,      // Número máximo de conexões no pool
  queueLimit: 0,            // Fila ilimitada de espera
});

/**
 * Função de teste (opcional) para verificar a conexão.
 */
export const testConnection = async () => {
  try {
    // Pega uma conexão do pool e liberta-a imediatamente
    const connection = await pool.getConnection();
    console.log(`[DB] Conexão com o MySQL (${config.DB_NAME}) estabelecida com sucesso.`);
    connection.release();
  } catch (error) {
    console.error('[DB] Erro ao conectar com o MySQL:', error.message);
    // Encerra o processo se não conseguir conectar ao banco
    process.exit(1);
  }
};

// Exporta o 'pool' para ser usado pelos 'models' (ex: user.model.js)
export default pool;

/**
 * --- Como Usar (Exemplo num 'user.model.js') ---
 *
 * import pool from '../config/db.js';
 *
 * export const findUserById = async (id) => {
 * try {
 * // Pega uma conexão do pool
 * const connection = await pool.getConnection();
 * * // Executa a query
 * const [rows] = await connection.execute(
 * 'SELECT * FROM users WHERE id = ?',
 * [id]
 * );
 * * // Devolve a conexão ao pool
 * connection.release();
 * * return rows[0];
 * } catch (error) {
 * console.error('Erro no modelo de utilizador:', error);
 * throw new Error('Erro ao buscar utilizador no banco.');
 * }
 * }
 *
 * // --- (Forma mais curta) ---
 * // O pool pode executar queries diretamente (ele gere o 'getConnection'
 * // e 'release' automaticamente)
 *
 * export const findUserByIdShort = async (id) => {
 * try {
 * const [rows] = await pool.execute(
 * 'SELECT * FROM users WHERE id = ?',
 * [id]
 * );
 * return rows[0];
 * } catch (error) {
 * // ...
 * }
 * }
 */