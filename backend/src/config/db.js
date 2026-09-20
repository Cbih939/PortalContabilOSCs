import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal_contabil',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- Helpers de migração idempotente -------------------------------------
const tableExists = async (conn, table) => {
    const [rows] = await conn.execute(
        'SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1',
        [table]
    );
    return rows.length > 0;
};

const columnExists = async (conn, table, column) => {
    const [rows] = await conn.execute(
        'SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1',
        [table, column]
    );
    return rows.length > 0;
};

const indexExists = async (conn, table, indexName) => {
    const [rows] = await conn.execute(
        'SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ? LIMIT 1',
        [table, indexName]
    );
    return rows.length > 0;
};

/**
 * Migrações do redesign UX/UI (espelham backend/src/db/migrations/*.sql).
 * Todas são aditivas e idempotentes: não removem nem alteram dados existentes.
 */
export const ensureSchema = async (conn) => {
    // 1) ADM Contador: contador dono/administrador do escritório.
    if (await tableExists(conn, 'users')) {
        if (!(await columnExists(conn, 'users', 'is_office_admin'))) {
            await conn.execute('ALTER TABLE users ADD COLUMN is_office_admin TINYINT(1) NOT NULL DEFAULT 0');
            console.log('[DB] Coluna users.is_office_admin criada.');
        }
        // 2) Onboarding: registra quando o usuário concluiu o tour de primeiro acesso.
        if (!(await columnExists(conn, 'users', 'onboarding_completed_at'))) {
            await conn.execute('ALTER TABLE users ADD COLUMN onboarding_completed_at DATETIME NULL DEFAULT NULL');
            console.log('[DB] Coluna users.onboarding_completed_at criada.');
        }
    }

    // 3) Índice para o histórico mensal de documentos (novo dashboard).
    if (await tableExists(conn, 'documents')) {
        if (!(await indexExists(conn, 'documents', 'idx_documents_osc_created'))) {
            await conn.execute('CREATE INDEX idx_documents_osc_created ON documents (osc_id, created_at)');
            console.log('[DB] Índice idx_documents_osc_created criado.');
        }
    }

    // 4) Histórico de pagamentos (lido pelo financeiro; antes nenhum código gravava aqui).
    await conn.execute(`
        CREATE TABLE IF NOT EXISTS payments (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
            status VARCHAR(30) NOT NULL DEFAULT 'succeeded',
            payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            stripe_session_id VARCHAR(255) NULL,
            PRIMARY KEY (id),
            KEY idx_payments_user (user_id),
            KEY idx_payments_date (payment_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
};

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
            VALUES ('Plano Padrão', 339.00, 'month', true)
          `);
            console.log('[DB] Plano padrão inicial inserido com sucesso.');
        }

        // Migrações do redesign (aditivas). Falha aqui não derruba o servidor.
        try {
            await ensureSchema(connection);
        } catch (migrationError) {
            console.error('[DB] Erro nas migrações do redesign:', migrationError.message);
        }

        connection.release();
    } catch (error) {
        console.error('[DB] Erro fatal ao conectar ao banco:', error.message);
    }
};

export default pool;
