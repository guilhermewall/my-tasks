import type { User } from "@core/entities/user";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  tokenId: string; // id do registro no DB
  iat: number;
  exp: number;
}

/**
 * Interface para gerenciamento de JWT (access e refresh tokens)
 * Implementações: JwtTokenService (infra/auth)
 */
export interface TokenService {
  /**
   * Gera um access token (curto, 15min)
   * @param user - Usuário para criar o token
   * @returns JWT access token
   */
  signAccessToken(user: User): string;

  /**
   * Verifica e decodifica um access token
   * @param token - JWT access token
   * @returns Payload decodificado
   * @throws Error se token inválido ou expirado
   */
  verifyAccessToken(token: string): AccessTokenPayload;

  /**
   * Gera um refresh token (longo, 7d) e salva no DB
   * @param user - Usuário para criar o token
   * @returns JWT refresh token
   */
  issueRefreshToken(user: User): Promise<string>;

  /**
   * Verifica e decodifica um refresh token
   * @param token - JWT refresh token
   * @returns Payload decodificado
   * @throws Error se token inválido ou expirado
   */
  verifyRefreshToken(token: string): RefreshTokenPayload;

  /**
   * Rotaciona um refresh token:
   * 1. Valida o token atual
   * 2. Marca como revogado no DB
   * 3. Gera novo par de tokens
   * @param refreshToken - Refresh token atual
   * @returns Novo par de tokens (access + refresh)
   * @throws Error se token inválido, expirado ou revogado
   */
  rotateRefreshToken(refreshToken: string): Promise<TokenPair>;

  /**
   * Revoga um ou todos os refresh tokens do usuário
   * @param refreshToken - Token a ser revogado
   * @param revokeAll - Se true, revoga todos os tokens do usuário
   * @returns void
   */
  revokeRefreshToken(refreshToken: string, revokeAll?: boolean): Promise<void>;
}
