import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { buildApp } from "@/infra/http/app";
import { FastifyInstance } from "fastify";

describe("Tasks Routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /tasks", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("POST");
      expect(routes).toContain("tasks");
    });
  });

  describe("GET /tasks", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("GET");
      expect(routes).toContain("tasks");
    });
  });

  describe("GET /tasks/:id", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("GET");
      expect(routes).toContain(":id");
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("PATCH");
      expect(routes).toContain(":id");
    });
  });

  describe("PATCH /tasks/:id/status", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("PATCH");
      expect(routes).toContain("status");
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should register route correctly", async () => {
      const routes = app.printRoutes();
      expect(routes).toContain("DELETE");
      expect(routes).toContain(":id");
    });
  });
});
