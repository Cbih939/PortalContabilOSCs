-- =============================================================================
-- 002_financeiro_users_review.sql  |  REVISÃO MANUAL — NÃO É AUTOMÁTICA
--
-- O perfil FINANCEIRO foi descontinuado. Contas com role 'FINANCEIRO' passam a ser
-- BLOQUEADAS no login (mensagem orienta procurar o administrador). Nenhuma conta é
-- convertida automaticamente, porque promover alguém a ADMIN concede poder total.
--
-- Rode o passo 1 para ver quem é afetado, e escolha UMA das opções do passo 2.
-- =============================================================================

-- 1) Contas afetadas
SELECT id, name, email, status, office_id
  FROM users
 WHERE UPPER(role) = 'FINANCEIRO';

-- 2a) OPÇÃO A — a pessoa passa a ser Administrador (visão global do financeiro)
-- UPDATE users SET role = 'ADMIN', office_id = NULL, is_office_admin = 0
--  WHERE id = <ID_DA_CONTA>;

-- 2b) OPÇÃO B — a pessoa passa a ser ADM Contador de um escritório (escopo do escritório)
-- UPDATE users SET role = 'CONTADOR', office_id = <ID_DO_ESCRITORIO>, is_office_admin = 1
--  WHERE id = <ID_DA_CONTA>;

-- 2c) OPÇÃO C — desativar a conta
-- UPDATE users SET status = 'Inativo' WHERE id = <ID_DA_CONTA>;
