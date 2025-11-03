import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "@infra/http";
import { ZodError } from "zod";
import {
  ValidationError,
  NotFoundError,
  InvalidCredentialsError,
  EmailAlreadyExistsError,
} from "@core/errors";

describe("Fastify App Configuration", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ logger: false });
  });

  afterEach(async () => {
    await app.close();
  });

  it("should create Fastify instance successfully", () => {
    expect(app).toBeDefined();
    expect(app.server).toBeDefined();
  });

  it("should have CORS plugin registered", () => {
    expect(app.hasPlugin("@fastify/cors")).toBe(true);
  });

  it("should have Helmet plugin registered", () => {
    expect(app.hasPlugin("@fastify/helmet")).toBe(true);
  });

  it("should have Rate Limit plugin registered", () => {
    expect(app.hasPlugin("@fastify/rate-limit")).toBe(true);
  });

  it("should have error handler configured", () => {
    expect(app.errorHandler).toBeDefined();
  });

  describe("Error Handler", () => {
    it("should handle ZodError with 400 status", async () => {
      const mockError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          path: ["email"],
          message: "Expected string, received number",
        },
      ] as any);

      app.get("/test-zod-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-zod-error",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Bad Request");
      expect(body.message).toBe("Validation error");
      expect(body.issues).toBeDefined();
      expect(body.issues[0].path).toBe("email");
    });

    it("should handle ValidationError with 400 status", async () => {
      const mockError = new ValidationError("Invalid input");

      app.get("/test-validation-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-validation-error",
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Bad Request");
      expect(body.message).toBe("Invalid input");
    });

    it("should handle EmailAlreadyExistsError with 409 status", async () => {
      const mockError = new EmailAlreadyExistsError("test@example.com");

      app.get("/test-conflict-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-conflict-error",
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Conflict");
      expect(body.message).toContain("already registered");
    });

    it("should handle InvalidCredentialsError with 401 status", async () => {
      const mockError = new InvalidCredentialsError();

      app.get("/test-auth-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-auth-error",
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("Invalid email or password");
    });

    it("should handle NotFoundError with 404 status", async () => {
      const mockError = new NotFoundError("Resource");

      app.get("/test-not-found-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-not-found-error",
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Not Found");
      expect(body.message).toBe("Resource not found");
    });

    it("should handle unknown errors with 500 status", async () => {
      const mockError = new Error("Unexpected error");

      app.get("/test-unknown-error", async () => {
        throw mockError;
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-unknown-error",
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe("Internal Server Error");
      expect(body.message).toBe("An unexpected error occurred");
    });
  });

  describe("Request Logging", () => {
    it("should log incoming requests", async () => {
      app.get("/test-logging", async () => {
        return { message: "OK" };
      });

      const response = await app.inject({
        method: "GET",
        url: "/test-logging",
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Health Check Preparation", () => {
    it("should be ready to register routes", () => {
      expect(app.register).toBeDefined();
      expect(typeof app.register).toBe("function");
    });
  });
});
