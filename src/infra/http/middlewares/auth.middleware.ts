import { FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "@/core/errors/auth-error";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

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

    // O token será validado pelo TokenService no use case
    // Aqui apenas extraímos o token e deixamos disponível
    request.headers["x-access-token"] = token;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Invalid authorization token");
  }
}
