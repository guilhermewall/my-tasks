import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "@/infra/http/app";
import { cleanDatabase, testHelpers } from "@/shared/test-helpers";

describe("Auth E2E Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = testHelpers.validRegisterData();

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("user");
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
      expect(body.user.email).toBe(userData.email);
      expect(body.user.name).toBe(userData.name);
      expect(body.user).toHaveProperty("id");
      expect(body.user).toHaveProperty("createdAt");
    });

    it("should not register user with duplicate email", async () => {
      const userData = testHelpers.validRegisterData();

      // Primeiro registro
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      // Segundo registro com mesmo email
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      expect(response.statusCode).toBe(409);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("already registered");
    });

    it("should validate email format", async () => {
      const userData = testHelpers.validRegisterData();
      userData.email = "invalid-email";

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should validate password strength", async () => {
      const userData = testHelpers.validRegisterData();
      userData.password = "weak";

      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      expect(response.statusCode).toBe(400);
    });

    it("should validate required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
      const userData = testHelpers.validRegisterData();

      // Registrar usuário
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      // Fazer login
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("user");
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
      expect(body.user.email).toBe(userData.email);
    });

    it("should not login with invalid email", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "nonexistent@example.com",
          password: "Test@123456",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Invalid email or password");
    });

    it("should not login with wrong password", async () => {
      const userData = testHelpers.validRegisterData();

      // Registrar usuário
      await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      // Tentar login com senha errada
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: userData.email,
          password: "WrongPassword123!",
        },
      });

      expect(response.statusCode).toBe(401);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("Invalid email or password");
    });

    it("should validate required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const userData = testHelpers.validRegisterData();

      // Registrar usuário
      const registerResponse = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      const { refreshToken: oldRefreshToken } = JSON.parse(
        registerResponse.body
      );

      // Renovar tokens
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: oldRefreshToken,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty("accessToken");
      expect(body).toHaveProperty("refreshToken");
      expect(body.refreshToken).not.toBe(oldRefreshToken); // Token rotation
    });

    it("should not refresh with invalid token", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: "invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should not refresh with revoked token", async () => {
      const userData = testHelpers.validRegisterData();

      // Registrar usuário
      const registerResponse = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      const { refreshToken } = JSON.parse(registerResponse.body);

      // Revogar token (logout)
      await app.inject({
        method: "DELETE",
        url: "/auth/logout",
        payload: {
          refreshToken,
        },
      });

      // Tentar usar token revogado
      const response = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should logout successfully", async () => {
      const userData = testHelpers.validRegisterData();

      // Registrar usuário
      const registerResponse = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      const { refreshToken } = JSON.parse(registerResponse.body);

      // Fazer logout
      const response = await app.inject({
        method: "DELETE",
        url: "/auth/logout",
        payload: {
          refreshToken,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toContain("revoked");
    });

    it("should be idempotent - accept invalid/already revoked tokens", async () => {
      // Comportamento idempotente: não falha se token já foi revogado
      const response = await app.inject({
        method: "DELETE",
        url: "/auth/logout",
        payload: {
          refreshToken: "invalid-token",
        },
      });

      // Aceita qualquer token (idempotente)
      expect(response.statusCode).toBe(200);
    });
  });

  describe("Complete Auth Flow", () => {
    it("should complete register → login → refresh → logout flow", async () => {
      const userData = testHelpers.validRegisterData();

      // 1. Registrar
      const registerResponse = await app.inject({
        method: "POST",
        url: "/auth/register",
        payload: userData,
      });

      expect(registerResponse.statusCode).toBe(201);
      const registerBody = JSON.parse(registerResponse.body);
      const userId = registerBody.user.id;

      // 2. Login
      const loginResponse = await app.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: userData.email,
          password: userData.password,
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginBody = JSON.parse(loginResponse.body);
      expect(loginBody.user.id).toBe(userId);

      // 3. Refresh token
      const refreshResponse = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: loginBody.refreshToken,
        },
      });

      expect(refreshResponse.statusCode).toBe(200);
      const refreshBody = JSON.parse(refreshResponse.body);

      // 4. Logout
      const logoutResponse = await app.inject({
        method: "DELETE",
        url: "/auth/logout",
        payload: {
          refreshToken: refreshBody.refreshToken,
        },
      });

      expect(logoutResponse.statusCode).toBe(200);

      // 5. Tentar usar token revogado
      const tryRefreshResponse = await app.inject({
        method: "POST",
        url: "/auth/refresh",
        payload: {
          refreshToken: refreshBody.refreshToken,
        },
      });

      expect(tryRefreshResponse.statusCode).toBe(401);
    });
  });
});
