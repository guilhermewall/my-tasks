import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
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
    origin: env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
