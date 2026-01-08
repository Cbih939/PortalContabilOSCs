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

// Função auxiliar para testar conexão no arranque do servidor
export const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('[DB] Conexão com o MySQL estabelecida com sucesso.');
        connection.release();
    } catch (error) {
        console.error('[DB] Erro fatal ao conectar ao banco:', error.message);
    }
};

export default pool;