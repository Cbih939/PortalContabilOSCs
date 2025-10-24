-- Migration 006: Adicionar campos de cadastro detalhado à tabela 'oscs'
ALTER TABLE `oscs`
ADD COLUMN `razao_social` VARCHAR(255) DEFAULT NULL AFTER `cnpj`,
ADD COLUMN `data_fundacao` DATE DEFAULT NULL AFTER `razao_social`,
ADD COLUMN `website` VARCHAR(255) DEFAULT NULL AFTER `address`,
ADD COLUMN `instagram` VARCHAR(100) DEFAULT NULL AFTER `website`,
ADD COLUMN `cep` VARCHAR(10) DEFAULT NULL AFTER `instagram`,
ADD COLUMN `numero` VARCHAR(20) DEFAULT NULL AFTER `cep`,
ADD COLUMN `bairro` VARCHAR(100) DEFAULT NULL AFTER `numero`,
ADD COLUMN `cidade` VARCHAR(100) DEFAULT NULL AFTER `bairro`,
ADD COLUMN `estado` VARCHAR(50) DEFAULT NULL AFTER `cidade`,
ADD COLUMN `pais` VARCHAR(50) DEFAULT 'Brasil' AFTER `estado`,
ADD COLUMN `responsible_cpf` VARCHAR(14) DEFAULT NULL AFTER `responsible`,
ADD COLUMN `logotipo_path` VARCHAR(512) DEFAULT NULL AFTER `pais`,
ADD COLUMN `ata_path` VARCHAR(512) DEFAULT NULL AFTER `logotipo_path`,
ADD COLUMN `estatuto_path` VARCHAR(512) DEFAULT NULL AFTER `ata_path`;