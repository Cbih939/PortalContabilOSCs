-- Migration 003: Criar a tabela de Documentos (documents)
-- Data: 20/10/2025
--
-- Esta tabela armazena os metadados de todos os ficheiros
-- enviados pela OSC ou pelo Contador.

CREATE TABLE IF NOT EXISTS `documents` (
    
    -- Chave primária
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- Contexto (A quem pertence este ficheiro?)
    `osc_id` INT(11) UNSIGNED NOT NULL COMMENT 'ID da OSC (de oscs.id) à qual este documento pertence',
    `uploaded_by_user_id` INT(11) UNSIGNED NOT NULL COMMENT 'ID do utilizador (de users.id) que fez o upload (seja OSC ou Contador)',
    
    -- Metadados do Ficheiro (armazenados no servidor)
    `original_name` VARCHAR(255) NOT NULL COMMENT 'Nome original do ficheiro (ex: balancete.pdf)',
    `saved_filename` VARCHAR(255) NOT NULL COMMENT 'Nome único do ficheiro no disco (ex: 1678886400000-balancete.pdf)',
    `file_path` VARCHAR(512) NOT NULL COMMENT 'Caminho completo para o ficheiro no servidor',
    `file_size_bytes` INT(11) UNSIGNED NOT NULL COMMENT 'Tamanho do ficheiro em bytes',
    `mime_type` VARCHAR(100) NOT NULL COMMENT 'Tipo do ficheiro (ex: application/pdf)',

    -- (Campos do Mock - Opcional, mas usado pelo controller que fizemos)
    -- Estes campos são redundantes se usarmos JOINs, mas facilitam queries simples.
    `from_name` VARCHAR(255) DEFAULT NULL COMMENT 'Nome do remetente (do protótipo)',
    `to_name` VARCHAR(255) DEFAULT NULL COMMENT 'Nome do destinatário (do protótipo)',

    -- Timestamps
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints (Restrições)
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_saved_filename` (`saved_filename`) COMMENT 'Garante que os nomes dos ficheiros no disco sejam únicos',
    
    -- Chaves Estrangeiras
    CONSTRAINT `fk_doc_osc`
        FOREIGN KEY (`osc_id`) 
        REFERENCES `oscs` (`id`)
        ON DELETE CASCADE, -- Se a OSC for apagada, apaga os seus documentos
        
    CONSTRAINT `fk_doc_uploader`
        FOREIGN KEY (`uploaded_by_user_id`) 
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT -- Não deixa apagar um utilizador que enviou ficheiros (ou 'SET NULL')

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;