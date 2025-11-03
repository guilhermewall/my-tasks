# 🚀 Deploy no Render - Totalmente Automatizado

## ✨ **NOVO: Deploy 100% Automatizado!**

Agora o `render.yaml` executa **TUDO automaticamente**:

- ✅ Build da aplicação
- ✅ Migrações do banco
- ✅ Seed de dados (opcional)
- ✅ Health checks configurados

## 1. Gerar Secrets JWT

### Execute localmente para gerar secrets seguros:

```bash
npm run generate-secrets
```

Isso vai gerar algo como:

```bash
JWT_ACCESS_SECRET=98a8303e6ffc9ffd8775e701d3e42b63040c31d65f2a29c2ccb6a14ea2287b1b...
JWT_REFRESH_SECRET=87934281cd0a10d4d6c4b0187c05b77c63731614271e41cee6d94527bbf9753...
```

## 2. Deploy no Render

### Passos simples:

1. **Vá para [render.com](https://render.com)**
2. **New → Blueprint**
3. **Conecte o repositório**: `guilhermewall/my-tasks`
4. **Branch**: `main` (ou sua branch atual)
5. **Adicione apenas as 2 variáveis JWT** (geradas no passo 1)
6. **Deploy automático** - O resto é tudo automático! 🎉

### ✅ **Comandos Automatizados:**

**Build (prepara a aplicação):**
- `npm install --include=dev` - Instalar todas as dependências (incluindo dev)
- `npm run build` - Compilar TypeScript para produção
- `npm prune --production` - Remover devDependencies (economizar espaço)

**Start (quando servidor inicia):**
- `npm run db:migrate:prod` - Executar migrações do banco
- `npm run post-deploy` - Setup pós-deploy (inclui seed se habilitado)
- `npm start` - Iniciar servidor#### 📊 **Outras variáveis** (já configuradas no render.yaml):

- ✅ `NODE_ENV=production`
- ✅ `HOST=0.0.0.0`
- ✅ `PORT=10000`
- ✅ `CORS_ORIGIN=*`
- ✅ `LOG_LEVEL=info`
- ✅ `JWT_ACCESS_EXPIRES=15m`
- ✅ `JWT_REFRESH_EXPIRES=7d`
- ✅ `BCRYPT_COST=11`
- ✅ `RATE_LIMIT_AUTH=10`
- ✅ `RATE_LIMIT_TASKS=120`
- ✅ `DATABASE_URL` (automático do PostgreSQL)

## 3. Configuração no Render

### Passo 1: Criar Nova Blueprint

1. Vá para [render.com](https://render.com)
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub: `guilhermewall/my-tasks`
4. Selecione a branch: `feat/docs`
5. O Render detectará automaticamente o `render.yaml`

### Passo 2: Configurar Secrets

Após criar o Blueprint, vá em "Environment" e adicione:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

### Passo 3: Deploy

1. Clique em "Create New Blueprint"
2. Aguarde o build e deploy (5-10 minutos)

## 4. Pós-Deploy

### Executar Migrações:

```bash
# No Shell do Render (Web Service):
npm run db:migrate
```

### Opcional - Popular com dados de teste:

```bash
npm run seed
```

## 5. Testar API

### Endpoints disponíveis:

- 🔍 **Health**: `https://your-app.onrender.com/health`
- 📚 **Docs**: `https://your-app.onrender.com/docs`
- 🔐 **Auth**: `https://your-app.onrender.com/auth/register`
- 📝 **Tasks**: `https://your-app.onrender.com/tasks`

### Teste básico:

```bash
curl https://your-app.onrender.com/health
```

## 6. Troubleshooting

### Se o build falhar:

1. ✅ Verifique se `render.yaml` está na raiz
2. ✅ Confirme que todas as env vars estão definidas
3. ✅ Verifique os logs no painel do Render
4. ✅ Certifique-se que o `package.json` tem `"type": "module"`

### Se a migração falhar:

```bash
# Execute manualmente no Shell do Render:
npx drizzle-kit push --config=drizzle.config.ts
```

## 7. URLs Finais

Após o deploy bem-sucedido:

- 🌐 **API**: `https://my-tasks-api.onrender.com`
- 📖 **Documentação**: `https://my-tasks-api.onrender.com/docs`
- 💚 **Health Check**: `https://my-tasks-api.onrender.com/health`

---

## 🎉 Pronto!

Sua API estará rodando em produção com:

- ✅ PostgreSQL configurado
- ✅ JWT authentication
- ✅ Rate limiting
- ✅ CORS liberado
- ✅ Logs estruturados
- ✅ Health checks
- ✅ Documentação Swagger
