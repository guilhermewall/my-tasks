# Logging Documentation

## Pino Logger Configuration

O logger Pino já está configurado na aplicação através do `buildApp()` em `src/infra/http/app.ts`.

### Configuração Atual

```typescript
logger: {
  level: env.LOG_LEVEL || "info",
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  } : undefined,
}
```

### Níveis de Log

- **fatal**: Erros críticos que causam shutdown
- **error**: Erros que precisam atenção
- **warn**: Avisos importantes
- **info**: Informações gerais (padrão)
- **debug**: Informações de debug
- **trace**: Informações muito detalhadas

### Configuração via Ambiente

No arquivo `.env`:

```
LOG_LEVEL=info  # ou: fatal, error, warn, info, debug, trace
```

### Uso nos Handlers

O logger está disponível em toda a aplicação:

```typescript
// Em rotas
app.get("/example", async (request, reply) => {
  request.log.info("Processando request");
  request.log.error({ error }, "Erro ao processar");
});

// No app
app.log.info("Servidor iniciado");
app.log.error({ error }, "Erro fatal");
```

### Hooks Configurados

1. **onRequest**: Loga todas as requisições recebidas

   - Method, URL

2. **onResponse**: Loga todas as respostas enviadas
   - Method, URL, Status Code, Response Time

### Pretty Print (Desenvolvimento)

Em ambiente de desenvolvimento, o Pino Pretty formata os logs de forma legível:

- ✅ Cores para diferentes níveis
- ✅ Timestamp formatado
- ✅ Remove campos desnecessários (pid, hostname)

### JSON (Produção)

Em produção, os logs são estruturados em JSON para facilitar parsing e análise:

- ✅ Fácil integração com ferramentas de log (ELK, Splunk, etc.)
- ✅ Melhor performance
- ✅ Estruturado para queries
