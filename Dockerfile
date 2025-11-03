# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./
COPY drizzle.config.ts ./

# Instalar dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY src ./src

# Build da aplicação
RUN npm run build

# Remover devDependencies
RUN npm prune --production

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos necessários do builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/drizzle.config.ts ./

# Copiar migrations (necessário para rodar em produção)
COPY --chown=nodejs:nodejs drizzle ./drizzle

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de start
CMD ["node", "dist/infra/http/server.js"]
