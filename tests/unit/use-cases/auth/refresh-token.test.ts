import { describe, it, expect, beforeEach, vi } from "vitest";
import { RefreshTokenUseCase } from "@app/use-cases/auth/refresh-token.use-case";
import { InvalidTokenError } from "@core/errors/invalid-token-error";
import type { TokenService } from "@app/interfaces/token-service";

describe("RefreshTokenUseCase (unit)", () => {
  let sut: RefreshTokenUseCase;
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

    sut = new RefreshTokenUseCase(tokenService);
  });

  describe("execute()", () => {
    it("deve renovar tokens com refresh token válido", async () => {
      const newTokens = {
        accessToken: "new.access.token",
        refreshToken: "new.refresh.token",
      };

      vi.mocked(tokenService.rotateRefreshToken).mockResolvedValue(newTokens);

      const input = {
        refreshToken: "old.refresh.token",
      };

      const result = await sut.execute(input);

      // Verifica se rotacionou o token
      expect(tokenService.rotateRefreshToken).toHaveBeenCalledWith(
        "old.refresh.token"
      );

      // Verifica resposta
      expect(result.tokens.accessToken).toBe("new.access.token");
      expect(result.tokens.refreshToken).toBe("new.refresh.token");
    });

    it("deve lançar InvalidTokenError se token é inválido", async () => {
      vi.mocked(tokenService.rotateRefreshToken).mockRejectedValue(
        new Error("Invalid token")
      );

      const input = {
        refreshToken: "invalid.token",
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidTokenError);
    });

    it("deve lançar InvalidTokenError se token está expirado", async () => {
      vi.mocked(tokenService.rotateRefreshToken).mockRejectedValue(
        new Error("Token expired")
      );

      const input = {
        refreshToken: "expired.token",
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidTokenError);
    });

    it("deve lançar InvalidTokenError se token foi revogado", async () => {
      vi.mocked(tokenService.rotateRefreshToken).mockRejectedValue(
        new Error("Token revoked")
      );

      const input = {
        refreshToken: "revoked.token",
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidTokenError);
    });
  });
});
