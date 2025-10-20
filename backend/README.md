backend/
├── .gitignore             # Ignora node_modules, .env, etc.
├── package.json           # Dependências (Express, mysql2, jsonwebtoken, bcrypt, cors...)
├── README.md              # Instruções de setup, deploy, e variáveis de ambiente
├── .env                   # ARQUIVO SECRETO: Senhas do banco, segredo do JWT (NUNCA vai para o GitHub)
├── .env.example           # Arquivo de exemplo para o .env (vai para o GitHub)
├── server.js              # Ponto de entrada: Inicia o servidor Express e conecta ao DB
│
├── src/                   # Diretório principal do código-fonte
│   │
│   ├── config/            # Configurações da aplicação
│   │   ├── db.js          # Configuração da conexão com o MySQL (pool de conexões)
│   │   └── index.js       # Carrega variáveis de ambiente (DB_HOST, JWT_SECRET, etc.)
│   │
│   ├── routes/            # Define todas as rotas da API (os "endpoints")
│   │   ├── index.js       # Roteador principal (junta todas as outras rotas)
│   │   ├── auth.routes.js   # Rotas de login (ex: /api/auth/login)
│   │   ├── users.routes.js  # Rotas de admin (ex: /api/users)
│   │   ├── oscs.routes.js   # Rotas para gerenciar OSCs (ex: /api/oscs)
│   │   ├── docs.routes.js   # Rotas para upload/download de documentos
│   │   ├── msg.routes.js    # Rotas para mensagens/chat
│   │   └── alerts.routes.js # Rotas para os avisos e alertas
│   │
│   ├── controllers/       # A "lógica" de cada rota
│   │   # (Recebe a requisição, valida, chama o serviço e envia a resposta)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── osc.controller.js
│   │   ├── doc.controller.js
│   │   ├── msg.controller.js
│   │   └── alert.controller.js
│   │
│   ├── services/          # Lógica de negócio (regras, interações complexas)
│   │   # (Opcional para apps menores, mas bom para modularidade)
│   │   ├── auth.service.js  # (ex: Gerar o token JWT)
│   │   └── file.service.js  # (ex: Processar um arquivo antes de salvar)
│   │
│   ├── models/            # Interação direta com o banco de dados (MySQL)
│   │   # (Aqui ficam as queries SQL ou os modelos de um ORM como o Sequelize)
│   │   ├── user.model.js    # (ex: findUserByEmail(), createUser())
│   │   ├── osc.model.js     # (ex: getAllOSCs(), getOSCById())
│   │   ├── document.model.js
│   │   └── message.model.js
│   │
│   ├── middlewares/       # Funções que rodam "no meio" da requisição
│   │   ├── auth.middleware.js # (ex: checkToken, checkRole - 'isAdmin', 'isContador')
│   │   ├── upload.middleware.js # Configuração do 'multer' para upload de arquivos
│   │   ├── validator.middleware.js # (ex: middlewares para validar o corpo da requisição)
│   │   └── errorHandler.js  # Um handler global para capturar erros
│   │
│   └── utils/             # Funções utilitárias
│       ├── bcrypt.utils.js  # Funções para hashear e comparar senhas
│       └── jwt.utils.js     # Funções para criar e verificar tokens
│
├── db/                    # Scripts do banco de dados
│   ├── migrations/        # MUITO IMPORTANTE: Scripts SQL para criar/alterar tabelas
│   │   ├── 001_create_users_table.sql
│   │   ├── 002_create_oscs_table.sql
│   │   ├── 003_create_documents_table.sql
│   │   └── ...
│   ├── seeds/             # (Opcional) Scripts para popular o banco com dados iniciais
│   │   └── 001_create_admin_user.sql
│
└── scripts/               # Scripts de utilidade/deploy
    └── deploy.sh          # (Exemplo) Script para rodar na VPS (git pull, npm install, run migrations...)