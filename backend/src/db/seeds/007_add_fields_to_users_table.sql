-- Migration 007: Adicionar CPF e Telefone à tabela 'users' (para Coordenador/Responsável)
ALTER TABLE `users`
ADD COLUMN `cpf` VARCHAR(14) DEFAULT NULL COMMENT 'CPF do utilizador (Coordenador ou Responsável)' AFTER `email`,
ADD COLUMN `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Telefone do utilizador (Coordenador ou Responsável)' AFTER `cpf`;