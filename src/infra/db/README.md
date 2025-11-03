# Database Layer

Esta pasta contém toda a configuração e estrutura do banco de dados usando Drizzle ORM.

## 📁 Estrutura

```
src/infra/db/
├── schema/              # Schemas do Drizzle (tabelas)
│   ├── users.ts        # Schema de usuários
│   ├── tasks.ts        # Schema de tarefas
│   ├── refresh-tokens.ts # Schema de tokens de refresh
│   └── index.ts        # Exportação centralizada
├── repositories/        # Implementações dos repositórios
├── connection.ts        # Configuração da conexão com o DB
├── migrate.ts          # Script para executar migrations
├── test-connection.ts  # Script para testar conexão
└── seed.ts             # Script para popular o banco

drizzle/
└── migrations/         # Arquivos SQL das migrations geradas
```

## 🗄️ Schemas

### Users

- `id` (uuid, pk)
- `name` (text)
- `email` (text, unique)
- `password_hash` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Tasks

- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `title` (text)
- `description` (text, nullable)
- `status` (enum: pending | done)
- `priority` (enum: low | medium | high)
- `due_date` (date, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Índices:**

- `(user_id, status)` - Para filtros por usuário e status
- `(user_id, created_at DESC)` - Para paginação cursor

### Refresh Tokens

- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `token_hash` (text, unique)
- `is_revoked` (boolean)
- `expires_at` (timestamptz)
- `created_at` (timestamptz)

**Índices:**

- `user_id` - Para buscar tokens por usuário
- `token_hash` - Para validação rápida de tokens

## 🚀 Comandos Úteis

### Gerar nova migration (após alterar schema)

```bash
npm run db:generate
```

### Aplicar migrations no banco

```bash
npm run db:migrate
```

### Testar conexão com o banco

```bash
npm run db:test
```

### Abrir Drizzle Studio (interface visual)

```bash
npm run db:studio
```

### Popular banco com dados de exemplo

```bash
npm run seed
```

## 🔄 Workflow de Migrations

1. **Altere o schema** em `src/infra/db/schema/*.ts`
2. **Gere a migration**: `npm run db:generate`
3. **Revise o SQL** gerado em `drizzle/migrations/`
4. **Aplique no banco**: `npm run db:migrate`
5. **Teste**: `npm run db:test`

## 📊 Drizzle Studio

Para visualizar e gerenciar dados:

```bash
npm run db:studio
```

Abre em: http://localhost:4983

## 🔍 Queries com Drizzle

```typescript
import { db } from "@infra/db/connection";
import { users, tasks } from "@infra/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Buscar usuário por email
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, "test@test.com"));

// Buscar tasks de um usuário
const userTasks = await db
  .select()
  .from(tasks)
  .where(eq(tasks.userId, userId))
  .orderBy(desc(tasks.createdAt));

// Criar nova task
await db.insert(tasks).values({
  userId: "uuid-here",
  title: "Nova tarefa",
  status: "pending",
  priority: "medium",
});
```

## ⚠️ Importante

- **Nunca** edite arquivos de migration manualmente após serem gerados
- **Sempre** gere novas migrations para mudanças no schema
- **Teste** as migrations em ambiente de desenvolvimento antes de produção
- **Backup** do banco antes de aplicar migrations em produção
