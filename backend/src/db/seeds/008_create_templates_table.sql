-- Migration 008: Criar a tabela de Ficheiros-Base/Modelos (templates)
-- Data: 25/10/2025
--
-- Esta tabela armazena ficheiros genéricos (modelos, guias, etc.)
-- que o Contador disponibiliza para TODAS as OSCs.

CREATE TABLE IF NOT EXISTS `templates` (
    
    -- Chave primária
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Informações do Ficheiro (Visíveis)
    `file_name` VARCHAR(255) NOT NULL COMMENT 'Nome de exibição (ex: Modelo de Controle Financeiro)',
    `description` VARCHAR(255) DEFAULT NULL COMMENT 'Nome real do ficheiro (ex: modelo_financeiro.xlsx)',
    
    -- Metadados do Ficheiro (Armazenado)
    `saved_filename` VARCHAR(255) NOT NULL COMMENT 'Nome único do ficheiro no disco',
    `file_path` VARCHAR(512) NOT NULL COMMENT 'Caminho completo para o ficheiro no servidor',
    `mime_type` VARCHAR(100) NOT NULL COMMENT 'Tipo do ficheiro (ex: application/vnd.ms-excel)',
    `file_size_bytes` INT(11) UNSIGNED NOT NULL COMMENT 'Tamanho em bytes',

    -- Dono do Ficheiro
    `uploaded_by_contador_id` INT(11) UNSIGNED DEFAULT NULL COMMENT 'ID do Contador (user) que fez o upload',
    
    -- Timestamps
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_saved_template_filename` (`saved_filename`),
    
    CONSTRAINT `fk_template_sender`
        FOREIGN KEY (`uploaded_by_contador_id`) 
        REFERENCES `users` (`id`)
        ON DELETE SET NULL -- Mantém o ficheiro se o contador for apagado

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;