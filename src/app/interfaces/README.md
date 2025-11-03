# App - Interfaces

Esta pasta contém as **interfaces (abstrações)** que definem os contratos entre a camada de aplicação (use cases) e as implementações concretas (adaptadores na camada de infra).

## Estrutura

```
/interfaces
  user-repository.ts      # Interface para persistência de usuários
  task-repository.ts      # Interface para persistência de tasks
  password-hasher.ts      # Interface para hash/verificação de senhas
  token-service.ts        # Interface para gerenciamento de JWT
  index.ts                # Barrel export
```

## Clean Architecture - Inversão de Dependência

Na Clean Architecture, seguimos o **Princípio da Inversão de Dependência (DIP)**:

> Módulos de alto nível (use cases) não devem depender de módulos de baixo nível (infra). Ambos devem depender de abstrações.

### Fluxo de dependências

```
┌─────────────────────────────────────────────────────────┐
│                     Use Cases                           │
│                  (camada de aplicação)                  │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  RegisterUserUseCase │  │  CreateTaskUseCase   │   │
│  │  constructor(        │  │  constructor(        │   │
│  │    userRepo,         │  │    taskRepo,         │   │
│  │    passwordHasher    │  │    ...               │   │
│  │  )                   │  │  )                   │   │
│  └──────────┬───────────┘  └──────────┬───────────┘   │
│             │                          │               │
│             │ depende de               │ depende de    │
│             ▼                          ▼               │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  UserRepository      │  │  TaskRepository      │   │
│  │  (interface)         │  │  (interface)         │   │
│  └──────────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                             │
                             │ implementado por
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Adaptadores (infra)                    │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │ DrizzleUserRepository│  │ DrizzleTaskRepository│   │
│  │ implements           │  │ implements           │   │
│  │ UserRepository       │  │ TaskRepository       │   │
│  └──────────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Vantagens desta abordagem

1. **Testabilidade**: Use cases podem ser testados com mocks/stubs sem depender de banco real
2. **Flexibilidade**: Trocar Drizzle por Prisma, ou bcrypt por argon2, sem alterar use cases
3. **Separação de responsabilidades**: Regras de negócio isoladas de detalhes técnicos
4. **Manutenibilidade**: Código mais fácil de entender e modificar

### Exemplo de uso

```typescript
// Use case depende da interface
import type { UserRepository, PasswordHasher } from "@app/interfaces";
import { User } from "@core/entities/user";
import { Email } from "@core/value-objects/email";
import { ConflictError } from "@core/errors";

export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher
  ) {}

  async execute(input: { name: string; email: string; password: string }) {
    // Valida email
    const emailVO = Email.create(input.email);

    // Verifica se já existe
    const existingUser = await this.userRepository.findByEmail(emailVO.value);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }

    // Cria hash da senha
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Cria entidade
    const user = User.create({
      name: input.name,
      email: emailVO,
      passwordHash,
    });

    // Persiste
    await this.userRepository.create(user);

    return user;
  }
}
```

```typescript
// Implementação concreta (infra/db)
import { UserRepository } from "@app/interfaces";
import { User } from "@core/entities/user";
import { Email } from "@core/value-objects/email";
import { PasswordHash } from "@core/value-objects/password-hash";
import { db } from "@infra/db/connection";
import { users } from "@infra/db/schema";

export class DrizzleUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const row = await db.select().from(users).where(eq(users.email, email));
    if (!row[0]) return null;

    return User.reconstitute({
      id: row[0].id,
      name: row[0].name,
      email: Email.create(row[0].email),
      passwordHash: PasswordHash.create(row[0].password_hash),
      createdAt: row[0].created_at,
      updatedAt: row[0].updated_at,
    });
  }

  // ... outros métodos
}
```

## Interfaces disponíveis

### UserRepository

Operações de persistência para usuários: buscar por email/id, criar, atualizar, deletar.

### TaskRepository

Operações de persistência para tasks: criar, buscar, listar (com filtros e paginação cursor), atualizar, deletar.

### PasswordHasher

Hash e verificação de senhas usando bcrypt.

### TokenService

Gerenciamento completo de JWT: gerar access/refresh tokens, verificar, rotacionar e revogar.
