# My Tasks API

> API de lista de tarefas multiusuário construída com Node.js, Fastify, Drizzle ORM, Zod, JWT e Docker seguindo Clean Architecture e princípios SOLID.

## 🚀 Stack Técnica

- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 5
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL 16
- **Validação**: Zod
- **Autenticação**: JWT (access + refresh tokens)
- **Testes**: Vitest
- **Containerização**: Docker & Docker Compose

## 📁 Estrutura do Projeto

```
src/
├── core/               # Regras de negócio puras
│   ├── entities/       # User, Task
│   ├── errors/         # DomainError, NotFoundError, etc.
│   └── value-objects/  # Email, PasswordHash
├── app/                # Casos de uso (Application layer)
│   ├── use-cases/      # createTask, listTasks, etc.
│   └── ports/          # Interfaces (repos, encrypter, jwt)
├── infra/              # Implementações de portas
│   ├── db/             # Drizzle schemas + repos
│   ├── http/           # Fastify server, routes, middlewares
│   ├── auth/           # JWT, password hashing
│   ├── logger/         # pino
│   └── config/         # env, config loader
├── interfaces/         # Controllers, DTO mappers, validators (Zod)
│   ├── controllers/
│   ├── validators/
│   └── presenters/
└── shared/             # Utils, types
tests/
├── unit/               # Testes unitários
└── integration/        # Testes de integração
```

## 🛠️ Setup

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- npm ou pnpm

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/guilhermewall/my-tasks.git
cd my-tasks
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Suba o banco de dados com Docker:

```bash
docker compose up -d postgres
```

5. Execute as migrations:

```bash
npm run db:generate
npm run db:push
```

6. (Opcional) Execute o seed:

```bash
npm run seed
```

## 🏃 Executando

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

### Testes

```bash
# Executar todos os testes
npm test

# Com interface visual
npm run test:ui

# Com coverage
npm run test:coverage
```

### Database

```bash
# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:push

# Abrir Drizzle Studio
npm run db:studio
```

## 📝 Scripts Disponíveis

- `dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `build` - Compila o projeto para produção
- `start` - Inicia o servidor em modo produção
- `lint` - Executa o ESLint
- `lint:fix` - Executa o ESLint e corrige problemas automaticamente
- `test` - Executa os testes
- `test:ui` - Executa os testes com interface visual
- `test:coverage` - Executa os testes e gera relatório de cobertura
- `db:generate` - Gera as migrations do Drizzle
- `db:push` - Aplica as migrations no banco de dados
- `db:studio` - Abre o Drizzle Studio para gerenciar o banco
- `seed` - Popula o banco com dados de exemplo

## 🔒 Autenticação

A API utiliza JWT com access tokens (15 minutos) e refresh tokens (7 dias):

- Access tokens são enviados no header `Authorization: Bearer <token>`
- Refresh tokens são armazenados com hash no banco e podem ser rotacionados
- Todos os endpoints de `/tasks` requerem autenticação

## 📚 Endpoints

### Autenticação

- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `POST /auth/refresh` - Renovar tokens
- `POST /auth/logout` - Fazer logout
- `GET /me` - Obter dados do usuário autenticado

### Tasks

- `POST /tasks` - Criar nova tarefa
- `GET /tasks` - Listar tarefas (com filtros e paginação)
- `GET /tasks/:id` - Obter tarefa específica
- `PATCH /tasks/:id/status` - Atualizar status da tarefa
- `DELETE /tasks/:id` - Deletar tarefa

### Health

- `GET /health` - Verificar status da API

## 🧪 Testes

O projeto mantém cobertura mínima de 70% nas camadas de use-cases e adapters.

## 📈 Métricas de Sucesso

- P95 de `GET /tasks` < 150ms com 10k tarefas por usuário
- Cobertura de testes ≥ 70%
- `docker compose up` sobe tudo em < 60s

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

ISC
