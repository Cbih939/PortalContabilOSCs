-- Migration 002: Criar a tabela de Organizações (oscs)
-- Data: 20/10/2025
--
-- Esta tabela armazena os dados cadastrais específicos de uma OSC.
-- Ela tem uma relação 1:1 com a tabela 'users'. O 'id' aqui
-- será o *mesmo* 'id' do registo correspondente na tabela 'users'
-- (onde role = 'OSC').

CREATE TABLE IF NOT EXISTS `oscs` (
    
    -- Chave Primária e Estrangeira (Relação 1:1 com users)
    `id` INT(11) UNSIGNED NOT NULL COMMENT 'Chave Primária, corresponde a users.id',
    
    -- Informações de Registo
    `cnpj` VARCHAR(18) NOT NULL COMMENT 'CNPJ da OSC (ex: 12.345.678/0001-99)',
    `responsible` VARCHAR(255) DEFAULT NULL COMMENT 'Nome do responsável pela OSC',
    
    -- Informações de Contacto (podem ser diferentes do login)
    `email` VARCHAR(255) DEFAULT NULL COMMENT 'Email de contacto (pode ser diferente do email de login)',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Telefone de contacto',
    `address` TEXT DEFAULT NULL COMMENT 'Endereço completo da OSC',

    -- Relação com o Contador
    `assigned_contador_id` INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID do utilizador (Contador) associado',
    
    -- Timestamps
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints (Restrições)
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_cnpj` (`cnpj`), -- Garante que não haja dois CNPJs iguais
    
    -- Define a Chave Estrangeira 1:1 para a tabela 'users'
    CONSTRAINT `fk_osc_user`
        FOREIGN KEY (`id`) 
        REFERENCES `users` (`id`)
        ON DELETE CASCADE, -- Se o 'user' for apagado, apaga a 'osc'
    
    -- Define a Chave Estrangeira para o Contador
    CONSTRAINT `fk_osc_contador`
        FOREIGN KEY (`assigned_contador_id`) 
        REFERENCES `users` (`id`)
        ON DELETE SET NULL -- Se o 'user' (Contador) for apagado, define esta coluna como NULA

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;