-- Migration 001: Criar a tabela de Utilizadores (users)
-- Data: 20/10/2025
--
-- Esta tabela armazena a identidade principal e credenciais de login
-- para todos os perfis (Admin, Contador, OSC).
-- As informações específicas de cada perfil (como CNPJ da OSC)
-- ficarão em tabelas separadas (ex: 'oscs') que farão referência a esta.

CREATE TABLE IF NOT EXISTS `users` (
    
    -- Chave primária: ID único para cada utilizador
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Informações Pessoais/Identificação
    `name` VARCHAR(255) NOT NULL COMMENT 'Nome do utilizador (Admin, Contador) ou da OSC',
    
    -- Credenciais de Login
    `email` VARCHAR(255) NOT NULL COMMENT 'Email de login, deve ser único',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'Senha hashada (ex: Bcrypt)',
    
    -- Controlo de Acesso e Estado
    `role` ENUM('Adm', 'Contador', 'OSC') NOT NULL COMMENT 'Perfil de permissão (de constants.js)',
    `status` ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo' COMMENT 'Status da conta',
    
    -- Timestamps (para auditoria)
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints (Restrições)
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_email` (`email`) -- Garante que não haja dois emails iguais

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;