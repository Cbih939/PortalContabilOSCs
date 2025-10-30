-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 30/10/2025 às 16:50
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `portal_contabil`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) UNSIGNED NOT NULL,
  `osc_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID da OSC destinatária (ou NULL para todas)',
  `title` varchar(255) NOT NULL COMMENT 'Título do alerta/aviso',
  `message` text NOT NULL COMMENT 'Mensagem do alerta/aviso',
  `type` enum('Informativo','Lembrete','Urgente') NOT NULL DEFAULT 'Informativo' COMMENT 'Tipo de aviso (do NoticesView)',
  `created_by_contador_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID do Contador que enviou (de users.id)',
  `read_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Status de leitura pela OSC (0=não lida, 1=lida)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `alerts`
--

INSERT INTO `alerts` (`id`, `osc_id`, `title`, `message`, `type`, `created_by_contador_id`, `read_status`, `created_at`, `updated_at`) VALUES
(1, 5, 'Pendencia', 'Aviso que você está com documentação pendente o envio', 'Lembrete', 2, 0, '2025-10-24 16:01:11', '2025-10-24 16:01:11'),
(2, 5, 'teste', 'teste', 'Informativo', 2, 0, '2025-10-24 16:43:51', '2025-10-24 16:43:51'),
(3, NULL, 'teste de envio', 'Mensagem ', 'Informativo', 2, 1, '2025-10-28 14:47:29', '2025-10-28 14:47:44');

-- --------------------------------------------------------

--
-- Estrutura para tabela `documents`
--

CREATE TABLE `documents` (
  `id` int(11) UNSIGNED NOT NULL,
  `osc_id` int(11) UNSIGNED NOT NULL COMMENT 'ID da OSC (de oscs.id) à qual este documento pertence',
  `uploaded_by_user_id` int(11) UNSIGNED NOT NULL COMMENT 'ID do utilizador (de users.id) que fez o upload (seja OSC ou Contador)',
  `original_name` varchar(255) NOT NULL COMMENT 'Nome original do ficheiro (ex: balancete.pdf)',
  `saved_filename` varchar(255) NOT NULL COMMENT 'Nome único do ficheiro no disco (ex: 1678886400000-balancete.pdf)',
  `file_path` varchar(512) NOT NULL COMMENT 'Caminho completo para o ficheiro no servidor',
  `file_size_bytes` int(11) UNSIGNED NOT NULL COMMENT 'Tamanho do ficheiro em bytes',
  `mime_type` varchar(100) NOT NULL COMMENT 'Tipo do ficheiro (ex: application/pdf)',
  `from_name` varchar(255) DEFAULT NULL COMMENT 'Nome do remetente (do protótipo)',
  `to_name` varchar(255) DEFAULT NULL COMMENT 'Nome do destinatário (do protótipo)',
  `to_contador_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID do Contador destinatário (de users.id)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `documents`
--

INSERT INTO `documents` (`id`, `osc_id`, `uploaded_by_user_id`, `original_name`, `saved_filename`, `file_path`, `file_size_bytes`, `mime_type`, `from_name`, `to_name`, `to_contador_id`, `created_at`, `updated_at`) VALUES
(1, 6, 6, 'EBook 10 Receitas Descomplicadas - Royal Chef.pdf.pdf', 'EBook 10 Receitas Descomplicadas - Royal Chef.pdf-1761331712430.pdf', 'C:\\PROJETOS\\portal-contabil-oscs\\PortalContabilOSCs\\backend\\uploads\\EBook 10 Receitas Descomplicadas - Royal Chef.pdf-1761331712430.pdf', 6474937, 'application/pdf', 'Associação Bem Estar', 'Contador', 2, '2025-10-24 18:48:32', '2025-10-24 18:48:32'),
(2, 3, 3, 'download.jpg', 'download-1761343554244.jpg', 'C:\\PROJETOS\\portal-contabil-oscs\\PortalContabilOSCs\\backend\\uploads\\download-1761343554244.jpg', 555850, 'image/jpeg', 'OSC Esperança', 'Contador', 2, '2025-10-24 22:05:54', '2025-10-24 22:05:54'),
(3, 3, 3, 'EBook 10 Receitas Descomplicadas - Royal Chef.pdf', 'EBook 10 Receitas Descomplicadas - Royal Chef-1761343578021.pdf', 'C:\\PROJETOS\\portal-contabil-oscs\\PortalContabilOSCs\\backend\\uploads\\EBook 10 Receitas Descomplicadas - Royal Chef-1761343578021.pdf', 6474937, 'application/pdf', 'OSC Esperança', 'Contador', 2, '2025-10-24 22:06:18', '2025-10-24 22:06:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `messages`
--

CREATE TABLE `messages` (
  `id` int(11) UNSIGNED NOT NULL,
  `osc_id` int(11) UNSIGNED NOT NULL COMMENT 'ID da OSC (de oscs.id) nesta conversa',
  `contador_id` int(11) UNSIGNED NOT NULL COMMENT 'ID do Contador (de users.id) nesta conversa',
  `text` text NOT NULL COMMENT 'O conteúdo da mensagem',
  `sender_role` enum('Contador','OSC') NOT NULL COMMENT 'Perfil de quem enviou',
  `sender_id` int(11) UNSIGNED NOT NULL COMMENT 'ID do utilizador (de users.id) que enviou',
  `from_name` varchar(255) DEFAULT NULL COMMENT 'Nome do remetente (para facilitar frontend - do protótipo)',
  `read_status` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Status de leitura pelo destinatário (0=não lida, 1=lida)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `messages`
--

INSERT INTO `messages` (`id`, `osc_id`, `contador_id`, `text`, `sender_role`, `sender_id`, `from_name`, `read_status`, `created_at`, `updated_at`) VALUES
(7, 3, 2, 'Olá, enviamos o balancete de Janeiro. Por favor, confirme o recebimento.', 'OSC', 3, 'OSC Esperança', 0, '2024-07-15 13:30:00', '2025-10-24 23:18:31'),
(8, 3, 2, 'Recebido. Estamos analisando e retornaremos em breve.', 'Contador', 2, 'Carlos Contador', 0, '2024-07-15 14:00:00', '2025-10-24 23:18:31'),
(9, 5, 2, 'Bom dia! Tenho uma dúvida sobre o imposto X. Podemos conversar?', 'OSC', 5, 'Associação Bem Estar', 0, '2024-07-22 12:00:00', '2025-10-24 23:18:31'),
(10, 4, 2, 'O relatório anual foi enviado. Aguardamos o parecer.', 'OSC', 4, 'Instituto Novo Amanhã', 0, '2024-07-20 17:00:00', '2025-10-24 23:18:31'),
(11, 5, 2, 'Claro, pode me ligar a qualquer momento.', 'Contador', 2, 'Carlos Contador', 0, '2024-07-22 12:15:00', '2025-10-24 23:18:31'),
(12, 5, 2, 'ok', 'Contador', 2, 'Carlos Contador', 0, '2025-10-24 23:18:49', '2025-10-24 23:18:49'),
(13, 3, 2, 'teste', 'OSC', 3, 'OSC Esperança', 0, '2025-10-24 23:38:43', '2025-10-24 23:38:43'),
(14, 3, 2, 'Olá senhor tudo bom?', 'Contador', 2, 'Carlos Contador', 0, '2025-10-24 23:39:55', '2025-10-24 23:39:55'),
(15, 3, 2, 'tudo bom sim e com você?', 'OSC', 3, 'OSC Esperança', 0, '2025-10-27 12:52:20', '2025-10-27 12:52:20'),
(16, 3, 2, 'perfeito', 'Contador', 2, 'Carlos Contador', 0, '2025-10-27 12:53:08', '2025-10-27 12:53:08'),
(17, 3, 2, 'olá você poderia me passar mais informações?', 'OSC', 3, 'OSC Esperança', 0, '2025-10-28 22:24:43', '2025-10-28 22:24:43');

-- --------------------------------------------------------

--
-- Estrutura para tabela `oscs`
--

CREATE TABLE `oscs` (
  `id` int(11) UNSIGNED NOT NULL COMMENT 'Chave Primária, corresponde a users.id',
  `cnpj` varchar(18) NOT NULL COMMENT 'CNPJ da OSC (ex: 12.345.678/0001-99)',
  `razao_social` varchar(255) DEFAULT NULL,
  `data_fundacao` date DEFAULT NULL,
  `responsible` varchar(255) DEFAULT NULL COMMENT 'Nome do responsável pela OSC',
  `responsible_cpf` varchar(14) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL COMMENT 'Email de contacto (pode ser diferente do email de login)',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Telefone de contacto',
  `address` text DEFAULT NULL COMMENT 'Endereço completo da OSC',
  `website` varchar(255) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `pais` varchar(50) DEFAULT 'Brasil',
  `logotipo_path` varchar(512) DEFAULT NULL,
  `ata_path` varchar(512) DEFAULT NULL,
  `estatuto_path` varchar(512) DEFAULT NULL,
  `assigned_contador_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID do utilizador (Contador) associado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `oscs`
--

INSERT INTO `oscs` (`id`, `cnpj`, `razao_social`, `data_fundacao`, `responsible`, `responsible_cpf`, `email`, `phone`, `address`, `website`, `instagram`, `cep`, `numero`, `bairro`, `cidade`, `estado`, `pais`, `logotipo_path`, `ata_path`, `estatuto_path`, `assigned_contador_id`, `created_at`, `updated_at`) VALUES
(3, '12.345.678/0001-99', NULL, NULL, 'Maria Silva', NULL, 'contato@esperanca.org', '(11) 98765-4321', 'Rua das Flores, 123, São Paulo, SP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brasil', NULL, NULL, NULL, 2, '2025-10-24 13:19:37', '2025-10-24 13:19:37'),
(4, '98.765.432/0001-11', NULL, NULL, 'João Pereira', NULL, 'contato@novoamanha.org', '(21) 91234-5678', 'Avenida Central, 456, Rio de Janeiro, RJ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brasil', NULL, NULL, NULL, 2, '2025-10-24 13:19:37', '2025-10-24 13:19:37'),
(5, '55.666.777/0001-22', NULL, NULL, 'Ana Costa ', NULL, 'contato@bemviver.org', '(31) 95555-8881', 'Praça da Liberdade, 789, Belo Horizonte, MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brasil', NULL, NULL, NULL, 2, '2025-10-24 13:19:37', '2025-10-24 16:33:14'),
(6, '23199195000133', NULL, NULL, 'Miriam da Silva', NULL, 'miriam@associacaobemestar.org.br', '9912345678', 'Rua das Flores, 123, São Paulo, SP', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Brasil', NULL, NULL, NULL, 2, '2025-10-24 18:07:22', '2025-10-24 18:07:22');

-- --------------------------------------------------------

--
-- Estrutura para tabela `templates`
--

CREATE TABLE `templates` (
  `id` int(11) UNSIGNED NOT NULL,
  `file_name` varchar(255) NOT NULL COMMENT 'Nome de exibição (ex: Modelo de Controle Financeiro)',
  `description` varchar(255) DEFAULT NULL COMMENT 'Nome real do ficheiro (ex: modelo_financeiro.xlsx)',
  `saved_filename` varchar(255) NOT NULL COMMENT 'Nome único do ficheiro no disco',
  `file_path` varchar(512) NOT NULL COMMENT 'Caminho completo para o ficheiro no servidor',
  `mime_type` varchar(100) NOT NULL COMMENT 'Tipo do ficheiro (ex: application/vnd.ms-excel)',
  `file_size_bytes` int(11) UNSIGNED NOT NULL COMMENT 'Tamanho em bytes',
  `uploaded_by_contador_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'ID do Contador (user) que fez o upload',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `templates`
--

INSERT INTO `templates` (`id`, `file_name`, `description`, `saved_filename`, `file_path`, `mime_type`, `file_size_bytes`, `uploaded_by_contador_id`, `created_at`) VALUES
(1, 'Planilha Formato base', 'planilha-formato-base.xlsx', 'planilha-formato-base-1761681548525.xlsx', 'C:\\PROJETOS\\portal-contabil-oscs\\PortalContabilOSCs\\backend\\uploads\\planilha-formato-base-1761681548525.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 12393, 2, '2025-10-28 19:59:08');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Nome do utilizador (Admin, Contador) ou da OSC',
  `email` varchar(255) NOT NULL COMMENT 'Email de login, deve ser único',
  `cpf` varchar(14) DEFAULT NULL COMMENT 'CPF do utilizador (Coordenador ou Responsável)',
  `phone` varchar(20) DEFAULT NULL COMMENT 'Telefone do utilizador (Coordenador ou Responsável)',
  `password_hash` varchar(255) NOT NULL COMMENT 'Senha hashada (ex: Bcrypt)',
  `role` enum('Adm','Contador','OSC') NOT NULL COMMENT 'Perfil de permissão (de constants.js)',
  `status` enum('Ativo','Inativo') NOT NULL DEFAULT 'Ativo' COMMENT 'Status da conta',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `cpf`, `phone`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@email.com', NULL, NULL, '$2b$10$6LHWreZKAgQuA.XpZlR8A.o7WT.PiQYtrpVPDN2EkHbuuPPazg9wK', 'Adm', 'Ativo', '2025-10-22 11:55:37', '2025-10-23 17:14:53'),
(2, 'Carlos Contador', 'carlos.contador@email.com', NULL, NULL, '$2b$10$6LHWreZKAgQuA.XpZlR8A.o7WT.PiQYtrpVPDN2EkHbuuPPazg9wK', 'Contador', 'Ativo', '2025-10-23 20:21:49', '2025-10-23 20:22:07'),
(3, 'OSC Esperança', 'osc.esperanca@email.com', NULL, NULL, '$2b$10$6LHWreZKAgQuA.XpZlR8A.o7WT.PiQYtrpVPDN2EkHbuuPPazg9wK', 'OSC', 'Ativo', '2025-10-23 19:44:02', '2025-10-23 19:59:10'),
(4, 'Instituto Novo Amanhã', 'osc.novoamanha@email.com', NULL, NULL, '$2b$10$6LHWreZKAgQuA.XpZlR8A.o7WT.PiQYtrpVPDN2EkHbuuPPazg9wK', 'OSC', 'Ativo', '2025-10-23 19:44:02', '2025-10-23 19:59:14'),
(5, 'Associação Bem Viver', 'osc.bemviver@email.com', NULL, NULL, '$2b$10$6LHWreZKAgQuA.XpZlR8A.o7WT.PiQYtrpVPDN2EkHbuuPPazg9wK', 'OSC', 'Inativo', '2025-10-23 19:44:02', '2025-10-24 13:51:06'),
(6, 'Associação Bem Estar', 'miriam@associacaobemestar.org.br', NULL, NULL, '$2b$10$Zm35.TpmqbtKwe0k9zUWJOEd3ljxSuwzVbAd9txh2kp5JItuJXFsG', 'OSC', 'Ativo', '2025-10-24 18:07:22', '2025-10-27 12:51:10');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alert_osc` (`osc_id`),
  ADD KEY `fk_alert_sender` (`created_by_contador_id`);

--
-- Índices de tabela `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_saved_filename` (`saved_filename`) COMMENT 'Garante que os nomes dos ficheiros no disco sejam únicos',
  ADD KEY `fk_doc_osc` (`osc_id`),
  ADD KEY `fk_doc_uploader` (`uploaded_by_user_id`),
  ADD KEY `fk_doc_contador_dest` (`to_contador_id`);

--
-- Índices de tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_msg_osc` (`osc_id`),
  ADD KEY `fk_msg_contador` (`contador_id`),
  ADD KEY `fk_msg_sender` (`sender_id`);

--
-- Índices de tabela `oscs`
--
ALTER TABLE `oscs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cnpj` (`cnpj`),
  ADD KEY `fk_osc_contador` (`assigned_contador_id`);

--
-- Índices de tabela `templates`
--
ALTER TABLE `templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_saved_template_filename` (`saved_filename`),
  ADD KEY `fk_template_sender` (`uploaded_by_contador_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `templates`
--
ALTER TABLE `templates`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `fk_alert_osc` FOREIGN KEY (`osc_id`) REFERENCES `oscs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alert_sender` FOREIGN KEY (`created_by_contador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `fk_doc_contador_dest` FOREIGN KEY (`to_contador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_doc_osc` FOREIGN KEY (`osc_id`) REFERENCES `oscs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_doc_uploader` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_msg_contador` FOREIGN KEY (`contador_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_msg_osc` FOREIGN KEY (`osc_id`) REFERENCES `oscs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `oscs`
--
ALTER TABLE `oscs`
  ADD CONSTRAINT `fk_osc_contador` FOREIGN KEY (`assigned_contador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_osc_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `templates`
--
ALTER TABLE `templates`
  ADD CONSTRAINT `fk_template_sender` FOREIGN KEY (`uploaded_by_contador_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
