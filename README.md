# 📝 My Tasks API# My Tasks API

Uma API RESTful completa para gerenciamento de tarefas (TODO), construída com **Node.js**, **Fastify**, **Drizzle ORM**, **PostgreSQL** e seguindo os princípios da **Clean Architecture**.> API de lista de tarefas multiusuário construída com Node.js, Fastify, Drizzle ORM, Zod, JWT e Docker seguindo Clean Architecture e princípios SOLID.

![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)## 🚀 Stack Técnica

![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

![License](https://img.shields.io/badge/license-ISC-green)- **Runtime**: Node.js 20 LTS

![Tests](https://img.shields.io/badge/tests-367%20passing-success)- **Framework**: Fastify 5

- **ORM**: Drizzle ORM

## ✨ Características- **Banco de Dados**: PostgreSQL 16

- **Validação**: Zod

- 🏗️ **Clean Architecture** - Separação clara de responsabilidades (Domain, Application, Infrastructure)- **Autenticação**: JWT (access + refresh tokens)

- 🔐 **Autenticação JWT** - Access tokens (15min) + Refresh tokens (7 dias) com rotação- **Testes**: Vitest

- ✅ **Validação Robusta** - Zod schemas para todas as entradas- **Containerização**: Docker & Docker Compose

- 🗄️ **PostgreSQL** - Banco de dados relacional com Drizzle ORM

- 📚 **Documentação Swagger** - Interface interativa em `/docs`## 📁 Estrutura do Projeto

- 🧪 **367+ Testes** - Unitários + Integração + E2E

- 🚀 **Rate Limiting** - Proteção contra abuso (120 req/min)```

- 🐳 **Docker Ready** - Containerização completasrc/

- 📊 **Health Checks** - Endpoints para monitoramento Kubernetes├── core/ # Regras de negócio puras

│ ├── entities/ # User, Task

## 🛠️ Stack Tecnológica│ ├── errors/ # DomainError, NotFoundError, etc.

│ └── value-objects/ # Email, PasswordHash

### Core├── app/ # Casos de uso (Application layer)

- **Node.js** 20+ - Runtime JavaScript│ ├── use-cases/ # createTask, listTasks, etc.

- **TypeScript** 5.x - Tipagem estática│ └── ports/ # Interfaces (repos, encrypter, jwt)

- **Fastify** 5.x - Framework web de alta performance├── infra/ # Implementações de portas

│ ├── db/ # Drizzle schemas + repos

### Database│ ├── http/ # Fastify server, routes, middlewares

- **PostgreSQL** 16 - Banco de dados relacional│ ├── auth/ # JWT, password hashing

- **Drizzle ORM** - Type-safe SQL query builder│ ├── logger/ # pino

- **Drizzle Kit** - Migrations e schema management│ └── config/ # env, config loader

├── interfaces/ # Controllers, DTO mappers, validators (Zod)

### Validação & Segurança│ ├── controllers/

- **Zod** - Schema validation│ ├── validators/

- **bcryptjs** - Hashing de senhas│ └── presenters/

- **jsonwebtoken** - JWT generation/validation└── shared/ # Utils, types

- **@fastify/jwt** - Plugin JWT para Fastifytests/

- **@fastify/helmet** - Security headers├── unit/ # Testes unitários

- **@fastify/cors** - CORS middleware└── integration/ # Testes de integração

- **@fastify/rate-limit** - Rate limiting```

### Documentação & Testing## 🛠️ Setup

- **@fastify/swagger** - OpenAPI 3.0 spec

- **@fastify/swagger-ui** - Interface interativa### Pré-requisitos

- **Vitest** - Framework de testes

- **@vitest/coverage-v8** - Cobertura de testes- Node.js 20+

- Docker & Docker Compose

### DevOps- npm ou pnpm

- **Docker** & **Docker Compose** - Containerização

- **tsx** - TypeScript execution### Instalação

- **tsup** - Build otimizado

- **ESLint** - Linter1. Clone o repositório:

## 📁 Estrutura do Projeto```bash

git clone https://github.com/guilhermewall/my-tasks.git

````cd my-tasks

my-tasks/```

├── src/

│   ├── core/                    # 🎯 Camada de Domínio (Domain Layer)2. Instale as dependências:

│   │   ├── entities/           # Entidades: User, Task

│   │   ├── value-objects/      # Value Objects: Email, PasswordHash```bash

│   │   └── errors/             # Domain errors customizadosnpm install

│   │```

│   ├── app/                     # 💼 Camada de Aplicação (Application Layer)

│   │   ├── use-cases/          # Use cases (regras de negócio)3. Configure as variáveis de ambiente:

│   │   │   ├── auth/          # RegisterUser, LoginUser, RefreshToken, RevokeToken

│   │   │   └── tasks/         # CreateTask, UpdateTask, DeleteTask, etc.```bash

│   │   ├── interfaces/         # Interfaces (DIP - Dependency Inversion)cp .env.example .env

│   │   │   ├── repositories/  # Contratos de repositórios# Edite o arquivo .env com suas configurações

│   │   │   └── services/      # Contratos de serviços externos```

│   │   └── dtos/              # DTOs e Schemas Zod

│   │4. Suba o banco de dados com Docker:

│   ├── infra/                   # 🔧 Camada de Infraestrutura (Infrastructure Layer)

│   │   ├── db/                 # Database (Drizzle, migrations, seed)```bash

│   │   │   ├── schemas/       # Drizzle schemas (users, tasks, refresh_tokens)docker compose up -d postgres

│   │   │   ├── repositories/  # Implementações dos repositórios```

│   │   │   └── seed.ts        # Script de seed

│   │   ├── http/               # HTTP Server (Fastify)5. Execute as migrations:

│   │   │   ├── routes/        # Rotas (auth, tasks, health)

│   │   │   ├── middlewares/   # Auth middleware```bash

│   │   │   ├── schemas/       # Swagger/OpenAPI schemasnpm run db:generate

│   │   │   ├── app.ts         # Configuração Fastifynpm run db:push

│   │   │   └── server.ts      # Entry point```

│   │   ├── auth/               # Autenticação (Bcrypt, JWT)

│   │   └── config/             # Configurações (env validation)6. (Opcional) Execute o seed:

│   │

│   └── shared/                  # 🔄 Utilitários compartilhados```bash

│       └── either/             # Either monad (error handling)npm run seed

│```

├── tests/                       # 🧪 Testes

│   ├── unit/                   # Testes unitários (367+)## 🏃 Executando

│   ├── integration/            # Testes de integração

│   └── e2e/                    # Testes E2E### Desenvolvimento

│

├── docker-compose.yml          # Docker services```bash

├── Dockerfile                  # Production buildnpm run dev

├── drizzle.config.ts           # Drizzle ORM config```

├── tsconfig.json               # TypeScript config

└── vitest.config.ts            # Vitest config### Produção

````

```````bash

## 🚀 Como Rodarnpm run build

npm start

### Pré-requisitos```



- **Node.js** 20+ instalado### Testes

- **Docker** e **Docker Compose** instalados

- **Git** instalado```bash

# Executar todos os testes

### 1. Clone o repositórionpm test



```bash# Com interface visual

git clone https://github.com/guilhermewall/my-tasks.gitnpm run test:ui

cd my-tasks

```# Com coverage

npm run test:coverage

### 2. Instale as dependências```



```bash### Database

npm install

``````bash

# Gerar migrations

### 3. Configure as variáveis de ambientenpm run db:generate



```bash# Aplicar migrations

cp .env.example .envnpm run db:push

```````

# Abrir Drizzle Studio

Edite o `.env` conforme necessário. Para desenvolvimento local, os valores padrão já funcionam.npm run db:studio

````

### 4. Suba os serviços Docker

## 📝 Scripts Disponíveis

```bash

docker compose up -d- `dev` - Inicia o servidor em modo desenvolvimento com hot reload

```- `build` - Compila o projeto para produção

- `start` - Inicia o servidor em modo produção

Isso irá iniciar:- `lint` - Executa o ESLint

- **PostgreSQL** (porta 5432)- `lint:fix` - Executa o ESLint e corrige problemas automaticamente

- **pgAdmin** (porta 5050) - Interface web para gerenciar o banco- `test` - Executa os testes

- **Drizzle Studio** (porta 4983) - Interface web para explorar schemas- `test:ui` - Executa os testes com interface visual

- `test:coverage` - Executa os testes e gera relatório de cobertura

### 5. Execute as migrations- `db:generate` - Gera as migrations do Drizzle

- `db:push` - Aplica as migrations no banco de dados

```bash- `db:studio` - Abre o Drizzle Studio para gerenciar o banco

npm run db:migrate- `seed` - Popula o banco com dados de exemplo

````

## 🔒 Autenticação

### 6. (Opcional) Popule o banco com dados de teste

A API utiliza JWT com access tokens (15 minutos) e refresh tokens (7 dias):

````bash

npm run seed- Access tokens são enviados no header `Authorization: Bearer <token>`

```- Refresh tokens são armazenados com hash no banco e podem ser rotacionados

- Todos os endpoints de `/tasks` requerem autenticação

Isso criará **3 usuários** e **17 tarefas** de exemplo. Veja as credenciais abaixo.

## 📚 Endpoints

### 7. Inicie o servidor

### Autenticação

```bash

npm run dev- `POST /auth/register` - Registrar novo usuário

```- `POST /auth/login` - Fazer login

- `POST /auth/refresh` - Renovar tokens

O servidor estará rodando em: **http://localhost:3333**- `POST /auth/logout` - Fazer logout

- `GET /me` - Obter dados do usuário autenticado

### 8. Acesse a documentação

### Tasks

Abra no navegador: **http://localhost:3333/docs**

- `POST /tasks` - Criar nova tarefa

Você verá a interface Swagger com todos os endpoints documentados e poderá testar diretamente na interface!- `GET /tasks` - Listar tarefas (com filtros e paginação)

- `GET /tasks/:id` - Obter tarefa específica

## 📚 Endpoints da API- `PATCH /tasks/:id/status` - Atualizar status da tarefa

- `DELETE /tasks/:id` - Deletar tarefa

### Health Checks

- `GET /health` - Status geral da aplicação### Health

- `GET /health/ready` - Readiness probe (Kubernetes)

- `GET /health/live` - Liveness probe (Kubernetes)- `GET /health` - Verificar status da API



### Autenticação## 🧪 Testes

- `POST /auth/register` - Registrar novo usuário

- `POST /auth/login` - Login (retorna access + refresh token)O projeto mantém cobertura mínima de 70% nas camadas de use-cases e adapters.

- `POST /auth/refresh` - Renovar tokens (token rotation)

- `DELETE /auth/logout` - Revogar refresh token## 📈 Métricas de Sucesso



### Tasks (Requer autenticação)- P95 de `GET /tasks` < 150ms com 10k tarefas por usuário

- `POST /tasks` - Criar nova tarefa- Cobertura de testes ≥ 70%

- `GET /tasks` - Listar tarefas (com filtros, paginação, ordenação)- `docker compose up` sobe tudo em < 60s

- `GET /tasks/:id` - Buscar tarefa por ID

- `PATCH /tasks/:id` - Atualizar tarefa## 🤝 Contribuindo

- `PATCH /tasks/:id/status` - Mudar status da tarefa

- `DELETE /tasks/:id` - Deletar tarefa1. Fork o projeto

2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)

### Filtros disponíveis em `GET /tasks`:3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)

- `status`: `pending` | `in_progress` | `completed` | `cancelled`4. Push para a branch (`git push origin feature/amazing-feature`)

- `priority`: `low` | `medium` | `high`5. Abra um Pull Request

- `search`: busca em title e description

- `sortBy`: `createdAt` | `dueDate` | `priority`## 📄 Licença

- `order`: `asc` | `desc`

- `limit`: número de resultados (padrão: 10, max: 100)ISC

- `cursor`: ID da última tarefa (paginação cursor-based)

## 🧪 Testes

### Rodar todos os testes

```bash
npm test
````

### Ver cobertura de testes

```bash
npm run test:coverage
```

### Interface visual de testes

```bash
npm run test:ui
```

### Estatísticas

- **367+ testes** passando
- **100% de cobertura** nas camadas de domínio e aplicação
- Tipos de testes:
  - ✅ Testes unitários (domain, use cases, DTOs)
  - ✅ Testes de integração (repositories, auth)
  - ✅ Testes E2E (fluxos completos da API)

## 👤 Usuários de Teste (Seed)

Após rodar `npm run seed`, você pode usar estas credenciais:

| Nome            | Email              | Senha    | Tarefas   |
| --------------- | ------------------ | -------- | --------- |
| João Silva      | joao@example.com   | Test@123 | 7 tarefas |
| Maria Santos    | maria@example.com  | Test@123 | 5 tarefas |
| Carlos Oliveira | carlos@example.com | Test@123 | 5 tarefas |

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)** com dois tipos de tokens:

1. **Access Token** (15 minutos)

   - Usado em todas as requisições autenticadas
   - Enviado no header: `Authorization: Bearer {token}`

2. **Refresh Token** (7 dias)
   - Usado apenas em `/auth/refresh`
   - Permite renovar o access token sem fazer login novamente
   - Implementa **token rotation** (cada refresh gera um novo par)

### Exemplo de fluxo

```bash
# 1. Registrar
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "Test@123"
  }'

# Resposta: { user: {...}, accessToken: "...", refreshToken: "..." }

# 2. Criar tarefa (use o accessToken)
curl -X POST http://localhost:3333/tasks \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Minha primeira tarefa",
    "description": "Descrição da tarefa",
    "priority": "high"
  }'

# 3. Renovar token (quando o access expirar)
curl -X POST http://localhost:3333/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'

# 4. Logout (revogar refresh token)
curl -X DELETE http://localhost:3333/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

## 🐳 Docker

### Desenvolvimento

```bash
# Subir apenas os serviços (PostgreSQL, pgAdmin, Drizzle Studio)
docker compose up -d

# Ver logs
docker compose logs -f

# Parar serviços
docker compose down
```

### Produção

```bash
# Build da imagem
docker build -t my-tasks-api .

# Rodar container
docker run -d \
  -p 3333:3333 \
  --env-file .env \
  --name my-tasks-api \
  my-tasks-api
```

O Dockerfile usa **multi-stage build** para otimizar o tamanho da imagem:

- Build stage: compila TypeScript
- Production stage: apenas runtime (Node slim)
- Imagem final: ~150MB

## 🏗️ Arquitetura

Este projeto segue os princípios da **Clean Architecture** (Uncle Bob):

### Camadas

1. **Domain Layer** (`src/core/`)

   - Entidades de negócio (User, Task)
   - Value Objects (Email, PasswordHash)
   - Domain errors
   - **Zero dependências externas**

2. **Application Layer** (`src/app/`)

   - Use cases (regras de negócio)
   - Interfaces (contratos)
   - DTOs e validações
   - **Depende apenas do Domain**

3. **Infrastructure Layer** (`src/infra/`)
   - Implementações concretas (Drizzle, Bcrypt, JWT)
   - HTTP server (Fastify)
   - Database, migrations, seeds
   - **Depende de Application e Domain**

### Princípios aplicados

- ✅ **Dependency Inversion Principle (DIP)** - Camadas internas não conhecem externas
- ✅ **Single Responsibility Principle (SRP)** - Cada classe tem uma única responsabilidade
- ✅ **Open/Closed Principle (OCP)** - Aberto para extensão, fechado para modificação
- ✅ **Interface Segregation Principle (ISP)** - Interfaces específicas
- ✅ **Repository Pattern** - Abstração do acesso a dados
- ✅ **Use Case Pattern** - Lógica de negócio isolada
- ✅ **Either Monad** - Error handling funcional

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor com hot-reload
npm run build            # Build de produção
npm start                # Rodar build de produção

# Database
npm run db:generate      # Gerar migrations
npm run db:migrate       # Executar migrations
npm run db:push          # Push schema (sem migrations)
npm run db:studio        # Abrir Drizzle Studio
npm run seed             # Popular banco com dados de teste

# Testes
npm test                 # Rodar todos os testes
npm run test:ui          # Interface visual de testes
npm run test:coverage    # Relatório de cobertura

# Qualidade de código
npm run lint             # Checar erros ESLint
npm run lint:fix         # Corrigir erros ESLint
```

## 🌍 Variáveis de Ambiente

| Variável              | Descrição                            | Padrão        | Obrigatório |
| --------------------- | ------------------------------------ | ------------- | ----------- |
| `NODE_ENV`            | Ambiente de execução                 | `development` | ❌          |
| `PORT`                | Porta do servidor                    | `3333`        | ❌          |
| `HOST`                | Host do servidor                     | `0.0.0.0`     | ❌          |
| `DATABASE_URL`        | URL de conexão PostgreSQL            | -             | ✅          |
| `JWT_ACCESS_SECRET`   | Secret do access token               | -             | ✅          |
| `JWT_REFRESH_SECRET`  | Secret do refresh token              | -             | ✅          |
| `JWT_ACCESS_EXPIRES`  | Expiração do access token            | `15m`         | ❌          |
| `JWT_REFRESH_EXPIRES` | Expiração do refresh token           | `7d`          | ❌          |
| `BCRYPT_COST`         | Custo do bcrypt (10-12)              | `11`          | ❌          |
| `CORS_ORIGIN`         | Origens permitidas para CORS         | `*`           | ❌          |
| `LOG_LEVEL`           | Nível de log (debug/info/warn/error) | `info`        | ❌          |
| `RATE_LIMIT_AUTH`     | Limite de req/min para auth          | `10`          | ❌          |
| `RATE_LIMIT_TASKS`    | Limite de req/min para tasks         | `120`         | ❌          |

## 🚀 Deploy

### Railway (Recomendado - Gratuito)

1. Crie uma conta em [Railway.app](https://railway.app)
2. Crie um novo projeto
3. Adicione PostgreSQL (marketplace)
4. Conecte seu repositório GitHub
5. Configure as variáveis de ambiente
6. Deploy automático! 🎉

### Render

1. Crie uma conta em [Render.com](https://render.com)
2. Crie um Web Service conectando ao GitHub
3. Adicione PostgreSQL (marketplace)
4. Configure variáveis de ambiente
5. Build Command: `npm install && npm run build && npm run db:migrate`
6. Start Command: `npm start`

### Fly.io

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Criar app
fly launch

# Configurar PostgreSQL
fly postgres create

# Deploy
fly deploy
```

### Variáveis essenciais para produção

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...  # URL do banco
JWT_ACCESS_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=another-super-secret-key-here
CORS_ORIGIN=https://your-frontend.com
```

⚠️ **IMPORTANTE**: Gere secrets fortes para produção! Use:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Exemplos de Uso

### Criar conta e fazer login

```typescript
// Registrar
const registerResponse = await fetch("http://localhost:3333/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "João Silva",
    email: "joao@example.com",
    password: "Test@123",
  }),
});

const { user, accessToken, refreshToken } = await registerResponse.json();
```

### Criar tarefa

```typescript
const taskResponse = await fetch("http://localhost:3333/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    title: "Implementar feature X",
    description: "Descrição detalhada",
    priority: "high",
    dueDate: "2025-12-31",
  }),
});

const { task } = await taskResponse.json();
```

### Listar tarefas com filtros

```typescript
// Tarefas pendentes, alta prioridade, ordenadas por data
const url = new URL("http://localhost:3333/tasks");
url.searchParams.set("status", "pending");
url.searchParams.set("priority", "high");
url.searchParams.set("sortBy", "dueDate");
url.searchParams.set("order", "asc");
url.searchParams.set("limit", "20");

const tasksResponse = await fetch(url, {
  headers: { Authorization: `Bearer ${accessToken}` },
});

const { tasks, pagination } = await tasksResponse.json();
```

### Atualizar status

```typescript
await fetch(`http://localhost:3333/tasks/${taskId}/status`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    status: "completed",
  }),
});
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [guilhermewall](https://github.com/guilhermewall)

---

## 🎯 Próximos Passos (Roadmap)

- [ ] Adicionar cache com Redis
- [ ] Implementar WebSockets para notificações em tempo real
- [ ] Adicionar upload de arquivos (anexos nas tarefas)
- [ ] Implementar tags/categorias para tarefas
- [ ] Sistema de compartilhamento de tarefas entre usuários
- [ ] API de estatísticas e relatórios
- [ ] Integração com calendários (Google Calendar, Outlook)
- [ ] Dark mode na documentação Swagger

## 📚 Recursos Úteis

- [Fastify Documentation](https://fastify.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Clean Architecture by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Zod Documentation](https://zod.dev/)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
