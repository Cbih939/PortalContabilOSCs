-- =============================================================================
-- 001_redesign_ux.sql  |  Conta Comigo — redesign UX/UI
-- Compatível com MySQL 5.7+/8.x e MariaDB 10.x. ADITIVA e IDEMPOTENTE:
-- pode ser executada mais de uma vez sem efeito colateral e não altera dados.
--
-- O backend já aplica estas mesmas alterações automaticamente no boot
-- (backend/src/config/db.js -> ensureSchema). Este arquivo existe para quem
-- prefere rodar a migração manualmente ANTES do deploy.
--
-- Uso:  mysql -u <usuario> -p <banco> < 001_redesign_ux.sql
-- Faça BACKUP antes:  mysqldump -u <usuario> -p <banco> > backup_pre_redesign.sql
-- =============================================================================

-- 1) ADM Contador: contador dono/administrador do escritório --------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'is_office_admin') = 0,
  'ALTER TABLE users ADD COLUMN is_office_admin TINYINT(1) NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) Onboarding: quando o usuário concluiu (ou pulou) o tour de primeiro acesso -----
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'onboarding_completed_at') = 0,
  'ALTER TABLE users ADD COLUMN onboarding_completed_at DATETIME NULL DEFAULT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) Índice do histórico mensal de documentos (novo dashboard) ---------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = 'documents' AND index_name = 'idx_documents_osc_created') = 0,
  'CREATE INDEX idx_documents_osc_created ON documents (osc_id, created_at)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) Histórico de pagamentos (lido pelo painel financeiro) -------------------------
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROLLBACK (só se necessário; remove apenas o que este arquivo criou):
--   ALTER TABLE users DROP COLUMN is_office_admin, DROP COLUMN onboarding_completed_at;
--   DROP INDEX idx_documents_osc_created ON documents;
--   (a tabela payments só deve ser removida se estiver vazia e não existia antes)
