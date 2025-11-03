import { FastifyInstance } from "fastify";
import { db } from "@/infra/db/connection";
import { sql } from "drizzle-orm";
import { env } from "@/infra/config/env";
import {
  healthLiveSchema,
  healthReadySchema,
  healthSchema,
} from "../schemas/health.schemas";

export async function healthRoutes(app: FastifyInstance) {
  // GET /health - Healthcheck endpoint
  app.get(
    "/health",
    {
      schema: healthSchema,
    },
    async (_request, reply) => {
      const startTime = Date.now();

      // Informações básicas
      const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: process.env.npm_package_version || "1.0.0",
      };

      // Verifica conexão com banco de dados
      try {
        await db.execute(sql`SELECT 1`);

        const responseTime = Date.now() - startTime;

        return reply.status(200).send({
          ...health,
          database: {
            status: "connected",
            responseTime: `${responseTime}ms`,
          },
        });
      } catch (error) {
        app.log.error({ error }, "Database health check failed");

        return reply.status(503).send({
          ...health,
          status: "degraded",
          database: {
            status: "disconnected",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }
  );

  // GET /health/ready - Readiness probe (para Kubernetes)
  app.get(
    "/health/ready",
    {
      schema: healthReadySchema,
    },
    async (_request, reply) => {
      try {
        await db.execute(sql`SELECT 1`);
        return reply.status(200).send({
          status: "ready",
          database: "connected",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        app.log.error({ error }, "Readiness check failed");
        return reply.status(503).send({
          status: "not ready",
          database: "disconnected",
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // GET /health/live - Liveness probe (para Kubernetes)
  app.get(
    "/health/live",
    {
      schema: healthLiveSchema,
    },
    async (_request, reply) => {
      return reply.status(200).send({
        status: "alive",
        timestamp: new Date().toISOString(),
      });
    }
  );
}
