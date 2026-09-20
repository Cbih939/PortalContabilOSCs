# PortalContabilOSCs
Um app para contadores

## Arquitetura do Sistema

O Portal Contábil OSCs está estruturado utilizando uma arquitetura moderna baseada em separação clara entre cliente e servidor, dividida entre um **Frontend (React com Vite)** e um **Backend (Node.js com Express e MySQL)**.

### 🖥️ Frontend (Interface do Usuário)
O frontend foi construído utilizando React 19 com o bundler Vite, o que garante uma inicialização rápida e uma compilação otimizada.

**1. Tecnologias Principais:**
- **React & Vite:** Base do projeto para a construção de interfaces (SPA - Single Page Application).
- **Roteamento:** `react-router-dom` para navegação entre páginas.
- **Requisições API:** `axios` para comunicação com o backend.
- **Gerenciamento de Formulários:** `react-hook-form` em conjunto com `yup` (para validação de schemas).
- **Estilização:** CSS puro (Vanilla CSS) com o auxílio do `clsx` para classes condicionais.
- **Outras Libs:** `recharts` para gráficos, `jspdf` para geração de PDFs, `react-icons` para iconografia e `react-imask` para máscaras de input.

**2. Organização de Diretórios (`frontend/src/`):**
A arquitetura de pastas segue um padrão altamente modular focado na componentização e separação de responsabilidades:
- 📁 **`components/`**: Peças de UI reutilizáveis (botões, modais, inputs, tabelas) que não dependem do contexto de uma página específica.
- 📁 **`pages/`**: Componentes maiores que representam as telas ou rotas da aplicação (ex: Dashboard, Login, Cadastros).
- 📁 **`contexts/`**: Utiliza a Context API do React para gerenciamento de estado global (ex: `AuthContext` para gerenciar a sessão do usuário).
- 📁 **`hooks/`**: Hooks customizados do React, encapsulando lógicas complexas para serem reutilizadas nos componentes.
- 📁 **`services/`**: Arquivos responsáveis por abstrair as chamadas à API do backend (configuração do Axios, métodos GET, POST, etc).
- 📁 **`routes/`**: Configuração das rotas da aplicação, definindo qual página renderizar para qual URL, além de proteger rotas privadas.
- 📁 **`utils/`**: Funções utilitárias, formatações de data/moeda e validações.
- 📁 **`assets/`**: Arquivos estáticos globais (imagens, fontes, SVGs).

---

### ⚙️ Backend (Servidor e Regra de Negócio)
O backend foi desenvolvido utilizando Node.js com o framework Express.js, utilizando uma arquitetura em camadas (inspirada no MVC), comunicando-se com um banco de dados MySQL.

**1. Tecnologias Principais:**
- **Node.js & Express:** Servidor HTTP para criação da API RESTful.
- **Banco de Dados:** `mysql2` para comunicação com banco relacional MySQL.
- **Autenticação e Segurança:** `jsonwebtoken` (JWT) para controle de sessão e proteção de rotas, e `bcryptjs` para criptografia de senhas.
- **Upload de Arquivos:** `multer` e `archiver` para lidar com upload/download de arquivos (anexos e documentos contábeis).
- **Validação de Dados:** `express-validator` e `yup` para validar os dados que chegam nas requisições.
- **Pagamentos:** Integração com a API do stripe.

**2. Organização de Diretórios (`backend/src/`):**
A arquitetura em camadas separa claramente a recepção da requisição, a lógica de negócio e o acesso ao banco de dados:
- 📁 **`routes/`**: Ponto de entrada da API. Define as URLs (ex: `/api/users`) e direciona a requisição para o controller correto.
- 📁 **`controllers/`**: Recebem as requisições HTTP, processam os dados de entrada, chamam os services (regra de negócio) e retornam a resposta HTTP (JSON) para o frontend.
- 📁 **`services/`**: Onde fica o "coração" do sistema (as regras de negócio). O service executa a lógica e interage com os models. Isso mantém os controllers limpos e focados apenas em responder à requisição.
- 📁 **`models/`**: Camada de acesso a dados. Responsável por executar as queries (SELECT, INSERT, UPDATE) diretamente no banco MySQL usando a biblioteca `mysql2`.
- 📁 **`middlewares/`**: Funções interceptadoras. Usadas principalmente para checar tokens JWT (autenticação), lidar com upload de arquivos (`multer`) e interceptar erros globais.
- 📁 **`config/`**: Configurações de ambiente, como a conexão com o banco de dados e variáveis do `.env`.
- 📁 **`db/`**: Possivelmente contém scripts de criação das tabelas (migrations manuais) ou seeds do banco.
- 📁 **`utils/`**: Funções auxiliares gerais utilizadas pelo backend.
- 📁 **`scripts/`**: Scripts secundários para execução de tarefas em background ou rotinas de manutenção.

---

### 💡 Resumo do Fluxo de Informação
1. O usuário clica em um botão no **Frontend** (`pages/` -> `components/`).
2. O componente chama uma função no **Service** do frontend (`frontend/src/services/`).
3. O Service faz uma requisição HTTP via Axios.
4. A requisição bate na **Route** do Backend (`backend/src/routes/`).
5. A rota pode passar por um **Middleware** (ex: verificar se o usuário está logado).
6. Se passar, chega ao **Controller** (`backend/src/controllers/`), que extrai os dados.
7. O Controller aciona a regra de negócio no **Service** (`backend/src/services/`).
8. O Service solicita dados ao **Model** (`backend/src/models/`), que consulta o MySQL.
9. Os dados fazem o caminho inverso até o Frontend, atualizando o estado e a interface do usuário.

---
Developed by @Cbih939