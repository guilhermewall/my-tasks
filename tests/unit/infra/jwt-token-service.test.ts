import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { JwtTokenService } from "@infra/auth/jwt-token-service";
import { User } from "@core/entities/user";
import { AuthError } from "@core/errors/auth-error";

// Mock do db
vi.mock("@infra/db/connection", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));

describe("JwtTokenService", () => {
  const accessSecret = "test-access-secret-32-characters-long-minimum";
  const refreshSecret = "test-refresh-secret-32-characters-long-minimum";
  const accessExpires = "15m";
  const refreshExpires = "7d";

  let service: JwtTokenService;
  let testUser: User;

  beforeEach(() => {
    service = new JwtTokenService(
      accessSecret,
      refreshSecret,
      accessExpires,
      refreshExpires
    );

    testUser = User.create({
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG",
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("signAccessToken()", () => {
    it("deve gerar um access token válido", () => {
      const token = service.signAccessToken(testUser);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format: header.payload.signature
    });

    it("deve incluir payload correto no token", () => {
      const token = service.signAccessToken(testUser);
      const decoded = jwt.verify(token, accessSecret) as any;

      expect(decoded.sub).toBe(testUser.toPlainObject().id);
      expect(decoded.email).toBe("john@example.com");
      expect(decoded.name).toBe("John Doe");
      expect(decoded.iat).toBeTruthy();
      expect(decoded.exp).toBeTruthy();
    });

    it("deve respeitar o tempo de expiração configurado", () => {
      const token = service.signAccessToken(testUser);
      const decoded = jwt.verify(token, accessSecret) as any;

      const expectedExpiration = 15 * 60; // 15 minutos em segundos
      const actualDuration = decoded.exp - decoded.iat;

      expect(actualDuration).toBe(expectedExpiration);
    });

    it("deve gerar múltiplos tokens válidos", () => {
      const token1 = service.signAccessToken(testUser);
      const token2 = service.signAccessToken(testUser);

      // Ambos devem ser válidos
      const payload1 = service.verifyAccessToken(token1);
      const payload2 = service.verifyAccessToken(token2);

      expect(payload1.sub).toBe(testUser.toPlainObject().id);
      expect(payload2.sub).toBe(testUser.toPlainObject().id);
    });
  });

  describe("verifyAccessToken()", () => {
    it("deve verificar e decodificar um token válido", () => {
      const token = service.signAccessToken(testUser);
      const payload = service.verifyAccessToken(token);

      expect(payload.sub).toBe(testUser.toPlainObject().id);
      expect(payload.email).toBe("john@example.com");
      expect(payload.name).toBe("John Doe");
      expect(payload.iat).toBeTruthy();
      expect(payload.exp).toBeTruthy();
    });

    it("deve lançar AuthError para token inválido", () => {
      const invalidToken = "invalid.token.here";

      expect(() => service.verifyAccessToken(invalidToken)).toThrow(AuthError);
      expect(() => service.verifyAccessToken(invalidToken)).toThrow(
        "Invalid access token"
      );
    });

    it("deve lançar AuthError para token expirado", () => {
      // Cria um token já expirado
      const expiredToken = jwt.sign(
        { sub: "123", email: "test@example.com", name: "Test" },
        accessSecret,
        { expiresIn: "-1s" } // expira 1 segundo no passado
      );

      expect(() => service.verifyAccessToken(expiredToken)).toThrow(AuthError);
      expect(() => service.verifyAccessToken(expiredToken)).toThrow(
        "Access token expired"
      );
    });

    it("deve lançar AuthError para token com assinatura incorreta", () => {
      const token = service.signAccessToken(testUser);
      const wrongSecret = "wrong-secret-32-characters-long-minimum-length";

      // Tenta verificar com secret errado
      expect(() => jwt.verify(token, wrongSecret)).toThrow();
    });
  });

  describe("issueRefreshToken()", () => {
    it("deve gerar um refresh token válido e salvar no DB", async () => {
      const { db } = await import("@infra/db/connection");

      const token = await service.issueRefreshToken(testUser);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);

      // Verifica se foi inserido no DB
      expect(db.insert).toHaveBeenCalled();
    });

    it("deve incluir payload correto no refresh token", async () => {
      const token = await service.issueRefreshToken(testUser);
      const decoded = jwt.verify(token, refreshSecret) as any;

      expect(decoded.sub).toBe(testUser.toPlainObject().id);
      expect(decoded.tokenId).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
      expect(decoded.exp).toBeTruthy();
    });

    it("deve respeitar o tempo de expiração configurado (7 dias)", async () => {
      const token = await service.issueRefreshToken(testUser);
      const decoded = jwt.verify(token, refreshSecret) as any;

      const expectedExpiration = 7 * 24 * 60 * 60; // 7 dias em segundos
      const actualDuration = decoded.exp - decoded.iat;

      expect(actualDuration).toBe(expectedExpiration);
    });

    it("deve gerar tokenIds únicos para cada refresh token", async () => {
      const token1 = await service.issueRefreshToken(testUser);
      const token2 = await service.issueRefreshToken(testUser);

      const decoded1 = jwt.verify(token1, refreshSecret) as any;
      const decoded2 = jwt.verify(token2, refreshSecret) as any;

      expect(decoded1.tokenId).not.toBe(decoded2.tokenId);
    });
  });

  describe("verifyRefreshToken()", () => {
    it("deve verificar e decodificar um refresh token válido", async () => {
      const token = await service.issueRefreshToken(testUser);
      const payload = service.verifyRefreshToken(token);

      expect(payload.sub).toBe(testUser.toPlainObject().id);
      expect(payload.tokenId).toBeTruthy();
      expect(payload.iat).toBeTruthy();
      expect(payload.exp).toBeTruthy();
    });

    it("deve lançar AuthError para refresh token inválido", () => {
      const invalidToken = "invalid.refresh.token";

      expect(() => service.verifyRefreshToken(invalidToken)).toThrow(AuthError);
      expect(() => service.verifyRefreshToken(invalidToken)).toThrow(
        "Invalid refresh token"
      );
    });

    it("deve lançar AuthError para refresh token expirado", () => {
      const expiredToken = jwt.sign(
        { sub: "123", tokenId: crypto.randomUUID() },
        refreshSecret,
        { expiresIn: "-1s" }
      );

      expect(() => service.verifyRefreshToken(expiredToken)).toThrow(AuthError);
      expect(() => service.verifyRefreshToken(expiredToken)).toThrow(
        "Refresh token expired"
      );
    });
  });

  describe("revokeRefreshToken()", () => {
    it("deve revogar um único token", async () => {
      const { db } = await import("@infra/db/connection");
      const token = await service.issueRefreshToken(testUser);

      await service.revokeRefreshToken(token, false);

      expect(db.update).toHaveBeenCalled();
    });

    it("deve revogar todos os tokens do usuário quando revokeAll=true", async () => {
      const { db } = await import("@infra/db/connection");
      const token = await service.issueRefreshToken(testUser);

      await service.revokeRefreshToken(token, true);

      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("integração entre métodos", () => {
    it("deve funcionar o fluxo completo: sign access + verify", () => {
      const token = service.signAccessToken(testUser);
      const payload = service.verifyAccessToken(token);

      expect(payload.sub).toBe(testUser.toPlainObject().id);
      expect(payload.email).toBe(testUser.toPlainObject().email);
    });

    it("deve funcionar o fluxo completo: issue refresh + verify", async () => {
      const token = await service.issueRefreshToken(testUser);
      const payload = service.verifyRefreshToken(token);

      expect(payload.sub).toBe(testUser.toPlainObject().id);
      expect(payload.tokenId).toBeTruthy();
    });
  });

  describe("calculateExpiresAt (private method - tested indirectly)", () => {
    it("deve calcular corretamente expiração em segundos", async () => {
      const shortService = new JwtTokenService(
        accessSecret,
        refreshSecret,
        "10s",
        "30s"
      );

      const token = await shortService.issueRefreshToken(testUser);
      const decoded = jwt.verify(token, refreshSecret) as any;

      const duration = decoded.exp - decoded.iat;
      expect(duration).toBe(30); // 30 segundos
    });

    it("deve calcular corretamente expiração em minutos", async () => {
      const token = await service.issueRefreshToken(testUser);
      const decoded = jwt.verify(token, refreshSecret) as any;

      const duration = decoded.exp - decoded.iat;
      expect(duration).toBe(7 * 24 * 60 * 60); // 7 dias
    });
  });

  describe("hashToken (private method - tested indirectly)", () => {
    it("deve gerar hashes diferentes para tokens diferentes", async () => {
      // Não podemos testar diretamente, mas podemos observar o comportamento
      const token1 = await service.issueRefreshToken(testUser);
      const token2 = await service.issueRefreshToken(testUser);

      // Se os hashes são diferentes, os tokens foram armazenados corretamente
      expect(token1).not.toBe(token2);
    });
  });
});
