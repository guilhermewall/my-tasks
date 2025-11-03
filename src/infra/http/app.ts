import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./error-handler";
import { routes } from "./routes";
import { env } from "@infra/config/env";

export interface BuildAppOptions {
  logger?: boolean;
}

/**
 * Cria e configura a aplicação Fastify
 *
 * @param options - Opções de configuração
 * @returns Instância do Fastify configurada
 */
export async function buildApp(
  options: BuildAppOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? {
      level: env.LOG_LEVEL || "info",
      base: null, // Remove pid e hostname dos logs
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    },
    disableRequestLogging: false,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "reqId",
  });

  // CORS - permitir requisições de diferentes origens
  await app.register(cors, {
    origin: true, // Permite todas as origens
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "Content-Type"],
  });

  // Helmet - headers de segurança
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
  });

  // Rate Limiting - proteção contra DDoS
  await app.register(rateLimit, {
    max: 100, // 100 requests
    timeWindow: "1 minute", // por minuto
    cache: 10000, // cache de 10k IPs
    allowList: ["127.0.0.1"], // whitelist localhost
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
  });

  // Swagger - Documentação OpenAPI
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "My Tasks API",
        description:
          "API RESTful para gerenciamento de tarefas com autenticação JWT. Implementada com Clean Architecture, Fastify, Drizzle ORM e PostgreSQL.",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "support@mytasks.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: env.API_URL || 
            (env.NODE_ENV === "production" 
              ? `http://${env.HOST}:${env.PORT}` 
              : `http://localhost:${env.PORT}`),
          description:
            env.NODE_ENV === "production"
              ? "Production server"
              : "Development server",
        },
      ],
      tags: [
        {
          name: "Health",
          description: "Health check endpoints",
        },
        {
          name: "Auth",
          description: "Authentication and authorization endpoints",
        },
        {
          name: "Tasks",
          description: "Task management endpoints",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token obtained from /auth/login",
          },
        },
      },
    },
  });

  // Swagger UI
  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
      filter: true,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Error handler global
  app.setErrorHandler(errorHandler);

  // Hook para log de requisições
  app.addHook("onRequest", async (request) => {
    request.log.info(
      { method: request.method, url: request.url },
      "Incoming request"
    );
  });

  // Hook para log de respostas
  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.elapsedTime,
      },
      "Request completed"
    );
  });

  // Serializer customizado para datas
  app.setSerializerCompiler(() => {
    return (data) => JSON.stringify(data);
  });

  // Registrar rotas
  await app.register(routes);

  return app;
}
