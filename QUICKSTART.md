# 🚀 Quick Start

## Pré-requisitos

- Docker Desktop instalado e **RODANDO**
- Node.js 20+

## Setup Rápido

1. **Inicie o Docker Desktop** (se ainda não estiver rodando)

2. **Suba o banco de dados**:

```bash
docker compose up -d postgres
```

3. **Verifique se está rodando**:

```bash
docker compose ps
```

Você deve ver algo assim:

```
NAME              IMAGE                COMMAND                  SERVICE    CREATED         STATUS                   PORTS
my-tasks-db       postgres:16-alpine   "docker-entrypoint.s…"   postgres   5 seconds ago   Up 4 seconds (healthy)   0.0.0.0:5432->5432/tcp
```

4. **Teste a conexão**:

```bash
docker compose exec postgres psql -U docker -d mytasks -c "\dt"
```

## 🎯 Próximos Passos

Agora que o banco está rodando, você pode:

1. Configurar o Drizzle ORM (Tarefa 3)
2. Criar as migrations
3. Rodar a aplicação

## ⚠️ Troubleshooting

### Docker Desktop não está rodando

```
❌ Error: Cannot connect to the Docker daemon
```

**Solução**: Inicie o Docker Desktop e aguarde alguns segundos

### Porta 5432 já está em uso

```
❌ Error: port is already allocated
```

**Solução**:

```bash
# Windows - encontre o processo usando a porta
netstat -ano | findstr :5432

# Mate o processo (substitua <PID> pelo número encontrado)
taskkill /PID <PID> /F

# Ou simplesmente pare qualquer PostgreSQL local rodando
```

### Container não fica saudável

```bash
# Veja os logs
docker compose logs postgres

# Recrie o container
docker compose down
docker compose up -d postgres
```

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f postgres

# Parar o banco
docker compose down

# Parar e apagar dados (recomeçar do zero)
docker compose down -v

# Acessar o banco diretamente
docker compose exec postgres psql -U docker -d mytasks
```

## 🔗 String de Conexão

```
postgresql://docker:docker@localhost:5432/mytasks
```

Já está configurada no arquivo `.env`!
