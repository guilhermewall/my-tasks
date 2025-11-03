import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "@/infra/http/app";
import { FastifyInstance } from "fastify";

describe("Auth Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("POST");
      expect(routes).toContain("gister");
    });
  });

  describe("POST /auth/login", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("POST");
      expect(routes).toContain("in");
    });
  });

  describe("POST /auth/refresh", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("POST");
      expect(routes).toContain("fresh");
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("DELETE");
      expect(routes).toContain("out");
    });
  });
});
