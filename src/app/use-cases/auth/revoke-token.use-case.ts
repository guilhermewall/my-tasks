import type { TokenService } from "@app/interfaces/token-service";

export interface RevokeTokenInput {
  refreshToken: string;
}

export interface RevokeTokenOutput {
  success: boolean;
}

/**
 * Use Case: Revogar refresh token (logout)
 *
 * Responsabilidades:
 * - Validar refresh token
 * - Adicionar token à blacklist
 *
 * @example
 * ```ts
 * const revokeToken = new RevokeTokenUseCase(tokenService);
 * await revokeToken.execute({
 *   refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 * });
 * ```
 */
export class RevokeTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(input: RevokeTokenInput): Promise<RevokeTokenOutput> {
    try {
      // 1. Revoga token (adiciona à blacklist)
      await this.tokenService.revokeRefreshToken(input.refreshToken);

      return { success: true };
    } catch (error) {
      // Se token é inválido, considera sucesso (já está "revogado")
      return { success: true };
    }
  }
}
