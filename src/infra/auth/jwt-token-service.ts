import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import type {
  TokenService,
  TokenPair,
  AccessTokenPayload,
  RefreshTokenPayload,
} from "@app/interfaces/token-service";
import type { User } from "@core/entities/user";
import { AuthError } from "@core/errors/auth-error";
import { env } from "@infra/config/env";
import { db } from "@infra/db/connection";
import { refreshTokens } from "@infra/db/schema";

/**
 * Implementação de TokenService usando JWT
 * Gerencia access tokens (curtos, stateless) e refresh tokens (longos, armazenados no DB)
 */
export class JwtTokenService implements TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpires: string;
  private readonly refreshExpires: string;

  constructor(
    accessSecret?: string,
    refreshSecret?: string,
    accessExpires?: string,
    refreshExpires?: string
  ) {
    this.accessSecret = accessSecret ?? env.JWT_ACCESS_SECRET;
    this.refreshSecret = refreshSecret ?? env.JWT_REFRESH_SECRET;
    this.accessExpires = accessExpires ?? env.JWT_ACCESS_EXPIRES;
    this.refreshExpires = refreshExpires ?? env.JWT_REFRESH_EXPIRES;
  }

  signAccessToken(user: User): string {
    const plainUser = user.toPlainObject();
    const payload = {
      sub: plainUser.id,
      email: plainUser.email,
      name: plainUser.name,
    };

    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpires,
    } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      const decoded = jwt.verify(
        token,
        this.accessSecret
      ) as AccessTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError("Access token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError("Invalid access token");
      }
      throw new AuthError("Failed to verify access token");
    }
  }

  async issueRefreshToken(user: User): Promise<string> {
    const plainUser = user.toPlainObject();

    // Cria registro no DB
    const tokenId = crypto.randomUUID();
    const expiresAt = this.calculateExpiresAt(this.refreshExpires);

    // Gera o JWT
    const payload = {
      sub: plainUser.id,
      tokenId,
    };
    const token = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpires,
    } as jwt.SignOptions);

    // Gera hash do token para armazenar no DB
    const tokenHash = this.hashToken(token);

    // Salva no DB
    await db.insert(refreshTokens).values({
      id: tokenId,
      userId: plainUser.id,
      tokenHash,
      expiresAt,
    });

    return token;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(
        token,
        this.refreshSecret
      ) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError("Invalid refresh token");
      }
      throw new AuthError("Failed to verify refresh token");
    }
  }

  async rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
    // 1. Valida o token JWT
    const payload = this.verifyRefreshToken(refreshToken);

    // 2. Verifica se existe no DB e não está revogado
    const tokenHash = this.hashToken(refreshToken);
    const [tokenRecord] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.id, payload.tokenId)
        )
      )
      .limit(1);

    if (!tokenRecord) {
      throw new AuthError("Refresh token not found");
    }

    if (tokenRecord.isRevoked) {
      throw new AuthError("Refresh token has been revoked");
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new AuthError("Refresh token expired");
    }

    // 3. Revoga o token atual
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, payload.tokenId));

    // 4. Busca o usuário para gerar novos tokens
    // Precisamos do User entity, mas aqui só temos userId
    // Por enquanto, vamos criar um User mock (será melhorado na Task 10)
    const mockUser = {
      toPlainObject: () => ({
        id: payload.sub,
        email: "", // Será preenchido pelo use case
        name: "", // Será preenchido pelo use case
      }),
    } as User;

    // 5. Gera novo par de tokens
    const accessToken = this.signAccessToken(mockUser);
    const newRefreshToken = await this.issueRefreshToken(mockUser);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(
    refreshToken: string,
    revokeAll = false
  ): Promise<void> {
    const payload = this.verifyRefreshToken(refreshToken);

    if (revokeAll) {
      // Revoga todos os tokens do usuário
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.userId, payload.sub));
    } else {
      // Revoga apenas este token
      const tokenHash = this.hashToken(refreshToken);
      await db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.tokenHash, tokenHash));
    }
  }

  /**
   * Gera um hash SHA256 do token para armazenar no DB
   * Não armazenamos o token em texto plano por segurança
   */
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Calcula a data de expiração baseada na string de duração (ex: '7d', '15m')
   */
  private calculateExpiresAt(duration: string): Date {
    const regex = /^(\d+)([smhdw])$/;
    const match = regex.exec(duration);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2];

    const now = new Date();
    switch (unit) {
      case "s":
        return new Date(now.getTime() + value * 1000);
      case "m":
        return new Date(now.getTime() + value * 60 * 1000);
      case "h":
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case "d":
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case "w":
        return new Date(now.getTime() + value * 7 * 24 * 60 * 60 * 1000);
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}
