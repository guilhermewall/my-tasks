# Docker Setup

## 🐳 Serviços Disponíveis

### PostgreSQL (Principal)

- **Porta**: 5432
- **Usuário**: docker
- **Senha**: docker
- **Database**: mytasks
- **Imagem**: postgres:16-alpine

### Drizzle Studio (Interface para DB)

- **Porta**: 4983
- **URL**: http://localhost:4983
- Interface visual para explorar e gerenciar dados

### pgAdmin (Opcional)

- **Porta**: 5050
- **URL**: http://localhost:5050
- **Email**: admin@admin.com
- **Senha**: admin
- Para usar: `docker compose --profile tools up pgadmin`

## 🚀 Comandos Úteis

### Iniciar todos os serviços

```bash
docker compose up -d
```

### Iniciar apenas o PostgreSQL

```bash
docker compose up -d postgres
```

### Iniciar com pgAdmin

```bash
docker compose --profile tools up -d
```

### Ver logs

```bash
docker compose logs -f
```

### Parar serviços

```bash
docker compose down
```

### Parar e remover volumes (⚠️ apaga dados)

```bash
docker compose down -v
```

### Recriar containers

```bash
docker compose up -d --force-recreate
```

## 🔍 Verificar Status

### Ver containers rodando

```bash
docker compose ps
```

### Testar conexão com o banco

```bash
docker compose exec postgres psql -U docker -d mytasks -c "SELECT version();"
```

## 📊 Volumes

Os dados são persistidos em volumes Docker:

- `my-tasks-postgres-data`: Dados do PostgreSQL
- `my-tasks-pgadmin-data`: Configurações do pgAdmin

## 🔗 Strings de Conexão

### Aplicação (local)

```
postgresql://docker:docker@localhost:5432/mytasks
```

### Dentro do Docker (container para container)

```
postgresql://docker:docker@postgres:5432/mytasks
```

## 🛠️ Troubleshooting

### Porta 5432 já está em uso

```bash
# Windows
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5432 | xargs kill -9
```

### Recriar banco do zero

```bash
docker compose down -v
docker compose up -d
```

### Acessar o container do PostgreSQL

```bash
docker compose exec postgres psql -U docker -d mytasks
```
