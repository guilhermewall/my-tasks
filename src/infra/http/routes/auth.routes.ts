import { FastifyInstance } from "fastify";
import {
  registerSchema as registerZod,
  loginSchema as loginZod,
  refreshTokenSchema as refreshTokenZod,
  revokeTokenSchema as revokeTokenZod,
} from "@/interfaces/http/dtos/auth";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "../schemas/auth.schemas";
import { RegisterUserUseCase } from "@/app/use-cases/auth/register-user.use-case";
import { LoginUserUseCase } from "@/app/use-cases/auth/login-user.use-case";
import { RefreshTokenUseCase } from "@/app/use-cases/auth/refresh-token.use-case";
import { RevokeTokenUseCase } from "@/app/use-cases/auth/revoke-token.use-case";
import { DrizzleUserRepository } from "@/infra/db/drizzle-user-repository";
import { BcryptPasswordHasher } from "@/infra/auth/bcrypt-password-hasher";
import { JwtTokenService } from "@/infra/auth/jwt-token-service";

export async function authRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const userRepository = new DrizzleUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();

  // Use cases
  const registerUser = new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    tokenService
  );
  const loginUser = new LoginUserUseCase(
    userRepository,
    passwordHasher,
    tokenService
  );
  const refreshToken = new RefreshTokenUseCase(tokenService);
  const revokeToken = new RevokeTokenUseCase(tokenService);

  // POST /auth/register
  app.post(
    "/auth/register",
    {
      schema: registerSchema,
    },
    async (request, reply) => {
      const body = registerZod.parse(request.body);
      const result = await registerUser.execute(body);

      return reply.status(201).send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    }
  );

  // POST /auth/login
  app.post(
    "/auth/login",
    {
      schema: loginSchema,
    },
    async (request, reply) => {
      const body = loginZod.parse(request.body);
      const result = await loginUser.execute(body);

      return reply.status(200).send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    }
  );

  // POST /auth/refresh
  app.post(
    "/auth/refresh",
    {
      schema: refreshTokenSchema,
    },
    async (request, reply) => {
      const body = refreshTokenZod.parse(request.body);
      const result = await refreshToken.execute(body);

      return reply.status(200).send({
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    }
  );

  // DELETE /auth/logout
  app.delete(
    "/auth/logout",
    {
      schema: logoutSchema,
    },
    async (request, reply) => {
      const body = revokeTokenZod.parse(request.body);
      await revokeToken.execute(body);

      return reply.status(204).send();
    }
  );
}
