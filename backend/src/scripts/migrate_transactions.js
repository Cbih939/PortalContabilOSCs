import pool from '../config/db.js';

async function runMigration() {
  try {
    console.log('Criando tabela transactions...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS transactions (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        osc_id INT UNSIGNED NOT NULL,
        type ENUM('RECEITA', 'DESPESA') NOT NULL,
        category VARCHAR(100) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        transaction_date DATE NOT NULL,
        receipt_filename VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_transaction_osc FOREIGN KEY (osc_id) REFERENCES oscs (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.execute(createTableQuery);
    console.log('Tabela transactions criada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela transactions:', error);
    process.exit(1);
  }
}

runMigration();
