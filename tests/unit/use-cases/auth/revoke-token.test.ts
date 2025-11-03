import { describe, it, expect, beforeEach, vi } from "vitest";
import { RevokeTokenUseCase } from "@app/use-cases/auth/revoke-token.use-case";
import type { TokenService } from "@app/interfaces/token-service";

describe("RevokeTokenUseCase (unit)", () => {
  let sut: RevokeTokenUseCase;
  let tokenService: TokenService;

  beforeEach(() => {
    // Mock TokenService
    tokenService = {
      signAccessToken: vi.fn(),
      verifyAccessToken: vi.fn(),
      issueRefreshToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      rotateRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
    };

    sut = new RevokeTokenUseCase(tokenService);
  });

  describe("execute()", () => {
    it("deve revogar refresh token com sucesso", async () => {
      vi.mocked(tokenService.revokeRefreshToken).mockResolvedValue();

      const input = {
        refreshToken: "valid.refresh.token",
      };

      const result = await sut.execute(input);

      // Verifica se revogou o token
      expect(tokenService.revokeRefreshToken).toHaveBeenCalledWith(
        "valid.refresh.token"
      );

      // Verifica resposta
      expect(result.success).toBe(true);
    });

    it("deve retornar sucesso mesmo se token é inválido (idempotente)", async () => {
      vi.mocked(tokenService.revokeRefreshToken).mockRejectedValue(
        new Error("Invalid token")
      );

      const input = {
        refreshToken: "invalid.token",
      };

      const result = await sut.execute(input);

      // Deve considerar sucesso (token já está "revogado")
      expect(result.success).toBe(true);
    });

    it("deve retornar sucesso mesmo se token já foi revogado", async () => {
      vi.mocked(tokenService.revokeRefreshToken).mockRejectedValue(
        new Error("Token already revoked")
      );

      const input = {
        refreshToken: "already.revoked.token",
      };

      const result = await sut.execute(input);

      // Deve considerar sucesso (idempotente)
      expect(result.success).toBe(true);
    });

    it("deve ser idempotente", async () => {
      vi.mocked(tokenService.revokeRefreshToken).mockResolvedValue();

      const input = {
        refreshToken: "token",
      };

      // Primeira chamada
      const result1 = await sut.execute(input);
      expect(result1.success).toBe(true);

      // Segunda chamada (simula token já revogado)
      vi.mocked(tokenService.revokeRefreshToken).mockRejectedValue(
        new Error("Already revoked")
      );

      const result2 = await sut.execute(input);
      expect(result2.success).toBe(true);
    });
  });
});
