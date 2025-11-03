# 🚀 Deploy no Render - Guia Completo

## 1. Preparação do Código

### Faça commit das mudanças:
```bash
git add .
git commit -m "feat: configurar deploy para Render"
git push origin feat/docs
```

## 2. Variáveis de Ambiente Necessárias

### No painel do Render, adicione estas Environment Variables:

#### 🔑 **Secrets JWT** (OBRIGATÓRIAS - Gere valores únicos!)
```bash
# Gere um secret forte de 64 caracteres para cada um:
JWT_ACCESS_SECRET=sua_chave_secreta_access_muito_forte_aqui_64_chars_min
JWT_REFRESH_SECRET=sua_chave_secreta_refresh_diferente_muito_forte_64_chars
```

**💡 Como gerar secrets seguros:**
```bash
# No terminal local, execute:
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

#### 📊 **Outras variáveis** (já configuradas no render.yaml):
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