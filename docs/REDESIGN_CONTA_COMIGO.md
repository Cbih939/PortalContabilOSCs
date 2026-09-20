# Redesign UX/UI e hierarquia de perfis — Conta Comigo

Branch: `redesign/ux-conta-comigo`. Objetivo: interface mobile-first, novo fluxo de envio de documentos,
dashboard com dados reais, onboarding guiado e hierarquia **Admin > ADM Contador > Contador > OSC**.
O perfil "Usuário Financeiro" foi descontinuado; suas funções foram redistribuídas.

## Perfis e permissões

| Recurso | Admin | ADM Contador | Contador | OSC |
|---|:-:|:-:|:-:|:-:|
| Escritórios (criar/excluir) | sim | — | — | — |
| Editar o próprio escritório | sim | sim | — | — |
| Usuários (criar/editar) | todos (exceto Financeiro) | só contadores do escritório | — | só o próprio perfil |
| OSCs | todas | do escritório | as vinculadas | a própria |
| Documentos (enviar/baixar) | todos | do escritório | das suas OSCs | os próprios |
| Financeiro (débitos, histórico) | global | só o escritório | — | — |
| Configuração do Stripe | sim | — | — | — |
| Auditoria/logs | tudo | do escritório | das suas OSCs | — |

"ADM Contador" é um contador com `users.is_office_admin = 1` (não é um role novo).
A autorização é aplicada no **servidor** (`backend/src/services/access.service.js`); o frontend só esconde o que o perfil não usa.

## Deploy (frontend e backend juntos — não faça deploy parcial)

1. **Backup** do banco: `mysqldump -u <usuario> -p <banco> > backup_pre_redesign.sql`.
2. **Rotacione os segredos** antes de subir: o `.env` do backend esteve versionado no repositório público.
   Gere um novo `JWT_SECRET` (mín. 16 caracteres; o servidor **não inicia** sem ele) e troque a senha do banco.
3. Migração: automática no boot (`ensureSchema` em `backend/src/config/db.js`) **ou** manual com
   `backend/src/db/migrations/001_redesign_ux.sql` (aditiva e idempotente).
4. Contas com role `FINANCEIRO` ficam **bloqueadas no login** (mensagem orienta procurar o Admin).
   Decida o destino de cada uma com `backend/src/db/migrations/002_financeiro_users_review.sql`.
5. Marque os contadores donos de escritório: `UPDATE users SET is_office_admin = 1 WHERE id = <id>;`
6. `cd frontend && npm ci && npm run build`; `pm2 restart` do backend (`backend/src/scripts/deploy.sh`).
7. Após o deploy, todos os usuários precisam entrar de novo (o segredo JWT mudou).

## Mudanças de API

- Novos: `GET /api/documents/stats`, `GET /api/auth/me`, `POST /api/auth/onboarding/complete`, `/api/financeiro/*`, `GET /api/transactions/:id/receipt`.
- Removidos: `/api/admin/financeiro/*` (migrados para `/api/financeiro/*`).
- `/uploads` (raiz) **deixou de ser público**: documentos contábeis só por rotas autenticadas. `/uploads/public` (logos, biblioteca, modelos) continua aberto.
- Chaves do Stripe nunca voltam em texto puro; campo em branco ao salvar mantém o valor atual.
- Login: limite de 10 falhas por IP+e-mail em 15 min (logins bem-sucedidos não contam).

## Decisões de produto adotadas (revisáveis)

1. ADM Contador = flag `is_office_admin`.
2. Contas FINANCEIRO bloqueadas, sem migração automática.
3. Stripe único da plataforma, configurável só pelo Admin.
4. "Documentos enviados no mês" conta por data de upload (`?basis=competencia` disponível).
5. Rótulos de status: "Em análise" / "Concluído".
6. Cor primária `#E85002`, com cinzas e preto/branco.
7. Assume-se que a produção roda a branch `main`.
8. ~20 documentos/mês é **referência**, não limite: o sistema nunca bloqueia envios acima disso.

## Pendências conhecidas

- Preço do checkout Stripe está fixo em R$ 339,00 no código, diferente da tabela `plans` (R$ 29,90). Não alterado.
- `backend/node_modules` (≈2.600 arquivos) e uploads antigos estão versionados; recomenda-se remover do git e ignorar.
- Telas antigas não redesenhadas (Projetos, Governança, Mensagens, Gerenciar usuários/OSCs/escritórios) foram apenas adaptadas ao novo layout e permissões.
