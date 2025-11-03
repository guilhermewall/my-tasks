import { FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "@/core/errors/auth-error";
import { JwtTokenService } from "@/infra/auth/jwt-token-service";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

const tokenService = new JwtTokenService();

/**
 * Middleware de autenticação
 * Valida o token JWT e extrai o userId
 */
export async function authMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new AuthError("Missing authorization header");
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AuthError("Invalid authorization header format");
    }

    // Valida e decodifica o token
    const payload = tokenService.verifyAccessToken(token);

    // Adiciona userId ao request para uso nos handlers
    request.userId = payload.sub;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Invalid authorization token");
  }
}
