import pool from '../config/db.js';

export const createTableIfNotExists = async () => {
  const query = `
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
  try {
    await pool.execute(query);
  } catch (err) {
    console.error('Error creating transactions table', err);
  }
};

export const findAllByOsc = async (oscId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM transactions WHERE osc_id = ? ORDER BY transaction_date DESC, created_at DESC',
    [oscId]
  );
  return rows;
};

export const createTransaction = async (oscId, data) => {
  const { type, category, description, amount, transaction_date, receipt_filename } = data;
  const [result] = await pool.execute(
    'INSERT INTO transactions (osc_id, type, category, description, amount, transaction_date, receipt_filename) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [oscId, type, category, description, amount, transaction_date, receipt_filename || null]
  );
  return result.insertId;
};

export const updateTransaction = async (id, oscId, data) => {
  const { type, category, description, amount, transaction_date, receipt_filename } = data;
  
  // Se o ficheiro não foi alterado, mantemos o mesmo, por isso podemos ter uma query dinâmica ou não atualizar o filename se for undefined.
  let query = 'UPDATE transactions SET type = ?, category = ?, description = ?, amount = ?, transaction_date = ?';
  let params = [type, category, description, amount, transaction_date];

  if (receipt_filename !== undefined) {
    query += ', receipt_filename = ?';
    params.push(receipt_filename);
  }

  query += ' WHERE id = ? AND osc_id = ?';
  params.push(id, oscId);

  const [result] = await pool.execute(query, params);
  return result.affectedRows > 0;
};

export const deleteTransaction = async (id, oscId) => {
  const [result] = await pool.execute(
    'DELETE FROM transactions WHERE id = ? AND osc_id = ?',
    [id, oscId]
  );
  return result.affectedRows > 0;
};
