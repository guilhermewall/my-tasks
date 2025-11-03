import { InvalidTokenError } from "@core/errors/invalid-token-error";
import type { TokenService, TokenPair } from "@app/interfaces/token-service";

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface RefreshTokenOutput {
  tokens: TokenPair;
}

/**
 * Use Case: Renovar access token usando refresh token
 *
 * Responsabilidades:
 * - Validar refresh token
 * - Verificar se token não foi revogado
 * - Gerar novo par de tokens (token rotation)
 * - Revogar refresh token antigo
 *
 * @example
 * ```ts
 * const refreshToken = new RefreshTokenUseCase(tokenService);
 * const result = await refreshToken.execute({
 *   refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 * });
 * ```
 */
export class RefreshTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    try {
      // 1. Rotaciona refresh token (valida, revoga antigo, gera novo par)
      const tokens = await this.tokenService.rotateRefreshToken(
        input.refreshToken
      );

      // 2. Retorna novos tokens
      return { tokens };
    } catch (error) {
      // Se falhar (token inválido, expirado ou revogado), lança erro
      throw new InvalidTokenError();
    }
  }
}
