frontend/
├── .gitignore             # Ignora arquivos como node_modules
├── package.json           # Dependências e scripts do projeto
├── tailwind.config.js     # Configuração do Tailwind CSS (já que você está usando)
├── postcss.config.js      # Necessário para o Tailwind
├── README.md              # Documentação do projeto
│
├── public/                # Arquivos estáticos
│   ├── index.html         # Template HTML principal
│   └── favicon.ico        # Ícone da aplicação
│
└── src/                   # Onde toda a mágica acontece
    │
    ├── App.js             # Componente raiz: define Contextos e Rotas
    ├── index.js           # Ponto de entrada: renderiza o App
    ├── index.css          # Importações do Tailwind e estilos globais
    │
    ├── assets/            # Imagens, fontes, etc.
    │   └── logo-escritorio.png
    │
    ├── components/        # Componentes UI reutilizáveis
    │   ├── common/        # Componentes genéricos (botões, inputs, etc.)
    │   │   ├── Button.js
    │   │   ├── Input.js
    │   │   ├── Modal.js     # Um componente de Modal genérico
    │   │   ├── Spinner.js   # Indicador de carregamento
    │   │   └── Icons.js     # TODOS os seus ícones SVGs exportados daqui
    │   │
    │   ├── layout/        # Componentes de estrutura da página
    │   │   ├── AppLayout.js # Layout principal (Sidebar + Header + Conteúdo)
    │   │   ├── GuestLayout.js # Layout para a tela de login (centralizado)
    │   │   ├── Header.js    # Cabeçalho (com perfil e notificações)
    │   │   └── Sidebar.js   # A barra lateral de navegação
    │   │
    │   └── messaging/     # Componentes de chat (reutilizados por OSC/Contador)
    │       ├── ChatWindow.js
    │       ├── MessageInput.js
    │       └── ContactList.js
    │
    ├── contexts/          # Gerenciamento de estado global
    │   ├── AuthContext.js   # Gerencia o usuário logado, token e 'role'
    │   └── NotificationContext.js # Para alertas globais (ex: "OSC salva!")
    │
    ├── hooks/             # Hooks customizados
    │   ├── useAuth.js       # Hook para consumir o AuthContext
    │   ├── useApi.js        # Hook genérico para chamadas API (loading, error, data)
    │   └── useDebounce.js   # Útil para os filtros de busca
    │
    ├── pages/             # Telas principais (mapeadas 1:1 com as rotas)
    │   ├── Login.js         # Sua tela de login (LoginPage)
    │   ├── NotFound.js      # Página 404
    │   │
    │   ├── admin/           # Páginas do painel do Administrador
    │   │   ├── AdminDashboard.js  # Página principal do Admin
    │   │   ├── ManageUsers.js     # Antigo UserManagement
    │   │   └── ManageOSCs.js      # Antigo OSCManagement
    │   │
    │   ├── contador/        # Páginas do painel do Contador
    │   │   ├── ContadorDashboard.js # Visão geral, relatórios (ReportsView)
    │   │   ├── OSCs.js          # Página que renderiza a OSCListView
    │   │   ├── Documents.js     # Página que renderiza a DocumentListView
    │   │   ├── Notices.js       # Página que renderiza a NoticesView
    │   │   ├── Messages.js      # Página que renderiza o MessengerView
    │   │   ├── Profile.js       # Perfil do Contador
    │   │   └── components/      # Componentes *específicos* do Contador
    │   │       ├── OSCListView.js
    │   │       ├── DocumentListView.js
    │   │       ├── NoticesView.js
    │   │       ├── ViewOSCModal.js
    │   │       ├── EditOSCModal.js
    │   │       ├── SendAlertModal.js
    │   │       └── NotificationModal.js
    │   │
    │   └── osc/             # Páginas do painel da OSC
    │       ├── OSCDashboard.js    # Página de Início (antiga InicioView)
    │       ├── Documents.js       # Página de Documentos (antiga DocumentsView)
    │       ├── Messages.js        # Página de Mensagens (usa o ChatWindow)
    │       ├── Profile.js         # Perfil da OSC (antiga ProfileView)
    │       └── components/        # Componentes *específicos* da OSC
    │           ├── AlertsModal.js
    │           ├── DocumentUpload.js
    │           └── UsefulDownloads.js # O card de "Downloads Úteis"
    │
    ├── routes/            # Configuração de roteamento
    │   ├── AppRoutes.js     # Define todas as rotas (usa ProtectedRoute)
    │   └── ProtectedRoute.js  # Protege rotas por autenticação e 'role'
    │
    ├── services/          # Conexão com o Backend (API)
    │   ├── api.js           # Instância do Axios (ou fetch) com baseURL
    │   ├── authService.js   # Funções: login(user, pass), logout()
    │   ├── oscService.js    # Funções: getOSCs(), updateOSC(id, data)
    │   ├── documentService.js # Funções: getFiles(), uploadFile(file)
    │   ├── messageService.js  # Funções: getMessages(oscId), sendMessage(text)
    │   └── alertService.js    # Funções: sendNotice(data), getAlerts()
    │
    └── utils/             # Funções utilitárias puras
        ├── formatDate.js    # (ex: formatTimestamp)
        ├── constants.js     # (ex: ROLES = { ADMIN: 'Adm', ... })
        └── mockData.js      # Seus dados mock (para usar antes da API)