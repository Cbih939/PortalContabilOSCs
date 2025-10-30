#!/bin/bash

# --- deploy.sh ---
# Script simples para deploy do backend Node.js numa VPS Linux.
#
# Pré-requisitos na VPS:
# 1. Git instalado
# 2. Node.js e NPM instalados
# 3. PM2 instalado globalmente (`npm install pm2 -g`)
# 4. Acesso ao servidor MySQL (para as migrações)
# 5. Ficheiro .env configurado manualmente na pasta do projeto NA VPS.

# --- Configuração ---
# (!!!) Altere estas variáveis para corresponder ao seu ambiente (!!!)
APP_DIR="/var/www/PortalContabilOSCs/backend" # O caminho absoluto para a pasta do backend na VPS
GIT_BRANCH="main"                          # O branch do Git a ser puxado (ex: main, master, develop)
PM2_APP_NAME="portal-contabil-backend"     # Nome da aplicação no PM2

# --- SCRIPT ---

# 1. Sair imediatamente se um comando falhar
set -e

# 2. Navegar para o diretório da aplicação
echo "Navegando para $APP_DIR..."
cd "$APP_DIR" || { echo "Erro: Diretório $APP_DIR não encontrado."; exit 1; }

# 3. (Opcional) Colocar a aplicação em modo de manutenção (se tiver um balanceador)
# echo "Ativando modo de manutenção..."
# (Comando para o seu balanceador de carga aqui)

# 4. Atualizar o código-fonte a partir do Git
echo "Atualizando código do branch '$GIT_BRANCH'..."
git checkout "$GIT_BRANCH" # Garante que está no branch correto
git fetch origin           # Busca as últimas alterações do repositório remoto
git pull origin "$GIT_BRANCH"

# 5. Instalar/Atualizar dependências do Node.js
#    '--production' ignora as devDependencies (ex: nodemon) na VPS
echo "Instalando dependências de produção..."
npm install --production

# 6. Verificar se o ficheiro .env existe (NÃO criar ou modificar)
if [ ! -f .env ]; then
  echo "AVISO: Ficheiro .env não encontrado em $APP_DIR."
  echo "Certifique-se de que criou e configurou o .env manualmente na VPS."
  # (Pode optar por sair aqui 'exit 1' se o .env for 100% necessário para as migrações)
fi

# 7. Executar migrações do banco de dados
#    (!!!) Isto assume que você tem um script 'npm run migrate' no seu package.json (!!!)
#    Este script pode usar uma ferramenta como 'node-pg-migrate', 'knex',
#    ou um script customizado para executar os ficheiros .sql em /db/migrations/
echo "Executando migrações do banco de dados..."
npm run migrate
# (Se não tiver um script 'migrate', comente a linha acima e execute manualmente)

# 8. (Opcional) Executar build (se usar TypeScript ou similar)
# echo "Executando build da aplicação..."
# npm run build

# 9. Reiniciar a aplicação com PM2
#    'pm2 restart' tenta reiniciar. Se a app não estiver a rodar, ele falha.
#    'pm2 start' inicia a app SE ela não estiver a rodar.
#    A combinação 'restart || start' garante que a app inicie ou reinicie.
echo "Reiniciando a aplicação '$PM2_APP_NAME' com PM2..."
pm2 restart "$PM2_APP_NAME" || pm2 start server.js --name "$PM2_APP_NAME"

# 10. (Opcional) Salvar a lista de processos do PM2
#     Garante que a app reinicie automaticamente se a VPS reiniciar
pm2 save
echo "Lista de processos PM2 salva."

# 11. (Opcional) Desativar modo de manutenção
# echo "Desativando modo de manutenção..."
# (Comando para o seu balanceador de carga aqui)

# 12. Mostrar o status final do PM2
echo "Status atual do PM2:"
pm2 list

echo "--- Deploy concluído com sucesso! ---"

# (Opcional) Mostrar os últimos logs para verificar se houve erros no arranque
# pm2 logs "$PM2_APP_NAME" --lines 50

exit 0