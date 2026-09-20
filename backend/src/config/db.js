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
        
        // Auto-migration para a tabela plans
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS plans (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            interval_type ENUM('month', 'year') NOT NULL DEFAULT 'month',
            is_active BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Inserir plano padrão caso a tabela esteja vazia
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM plans');
        if (rows[0].count === 0) {
          await connection.execute(`
            INSERT INTO plans (name, amount, interval_type, is_active)
            VALUES ('Plano Padrão', 29.90, 'month', true)
          `);
          console.log('[DB] Plano padrão inicial inserido com sucesso.');
        }

        connection.release();
    } catch (error) {
        console.error('[DB] Erro fatal ao conectar ao banco:', error.message);
    }
};

export default pool;