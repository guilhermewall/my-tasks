import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "@/infra/http/app";
import { FastifyInstance } from "fastify";

describe("Health Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("should return health status with database check", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("uptime");
      expect(body).toHaveProperty("environment");
      expect(body).toHaveProperty("version");
      expect(body).toHaveProperty("database");
      expect(body.database).toHaveProperty("status");
      expect(body.database.status).toBe("connected");
    });
  });

  describe("GET /health/ready", () => {
    it("should return readiness status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/ready",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("status");
      expect(body.status).toBe("ready");
    });
  });

  describe("GET /health/live", () => {
    it("should return liveness status", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health/live",
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("status");
      expect(body.status).toBe("alive");
      expect(body).toHaveProperty("timestamp");
    });
  });
});
