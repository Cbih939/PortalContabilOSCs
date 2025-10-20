-- Seed 001: Criar o Utilizador Administrador Padrão
--
-- Este ficheiro insere o primeiro utilizador (Admin)
-- necessário para aceder ao sistema pela primeira vez.
--
-- Email: admin@email.com
-- Senha: 123456
--
-- O 'hash' abaixo foi gerado usando bcrypt (10 rondas) para a senha "123456".

-- 'INSERT IGNORE' garante que, se o 'admin@email.com' já existir
-- (ex: se o seed for executado novamente), ele não falhará.
INSERT IGNORE INTO `users` (
    `name`,
    `email`,
    `password_hash`,
    `role`,
    `status`
) VALUES (
    'Administrador',
    'admin@email.com',
    '$2a$10$mE.q.C.F.A.p.e.K.e.m.i.w.U.T.o.o.j.Y.y.H.O.o.q.Z.J.S.C.w.u', -- Hash para "123456"
    'Adm',
    'Ativo'
);