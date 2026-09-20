import pool from '../config/db.js';

async function runMigration() {
  try {
    console.log('Criando tabela plans...');
    
    const createTableQuery = `
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
    `;

    await pool.execute(createTableQuery);
    console.log('Tabela plans criada com sucesso!');

    // Inserir plano padrão caso a tabela esteja vazia
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM plans');
    if (rows[0].count === 0) {
      console.log('Inserindo plano padrão inicial...');
      await pool.execute(`
        INSERT INTO plans (name, amount, interval_type, is_active)
        VALUES ('Plano Padrão', 29.90, 'month', true)
      `);
      console.log('Plano padrão inserido com sucesso!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela plans:', error);
    process.exit(1);
  }
}

runMigration();
