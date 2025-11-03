import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginUserUseCase } from "@app/use-cases/auth/login-user.use-case";
import { InvalidCredentialsError } from "@core/errors/invalid-credentials-error";
import { User } from "@core/entities/user";
import type { UserRepository } from "@app/interfaces/user-repository";
import type { PasswordHasher } from "@app/interfaces/password-hasher";
import type { TokenService } from "@app/interfaces/token-service";

describe("LoginUserUseCase (unit)", () => {
  let sut: LoginUserUseCase;
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenService: TokenService;

  beforeEach(() => {
    // Mock UserRepository
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Mock PasswordHasher
    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    // Mock TokenService
    tokenService = {
      signAccessToken: vi.fn().mockReturnValue("access.token.mock"),
      verifyAccessToken: vi.fn(),
      issueRefreshToken: vi.fn().mockResolvedValue("refresh.token.mock"),
      verifyRefreshToken: vi.fn(),
      rotateRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
    };

    sut = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  });

  describe("execute()", () => {
    it("deve autenticar usuário com credenciais válidas", async () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2b$10$hashedPassword",
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordHasher.verify).mockResolvedValue(true);

      const input = {
        email: "john@example.com",
        password: "SecurePass123!",
      };

      const result = await sut.execute(input);

      // Verifica se buscou usuário
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );

      // Verifica se validou senha
      expect(passwordHasher.verify).toHaveBeenCalledWith(
        "SecurePass123!",
        "$2b$10$hashedPassword"
      );

      // Verifica se gerou tokens
      expect(tokenService.signAccessToken).toHaveBeenCalledWith(user);
      expect(tokenService.issueRefreshToken).toHaveBeenCalledWith(user);

      // Verifica resposta
      expect(result.user.id).toBe(user.id);
      expect(result.user.name).toBe("John Doe");
      expect(result.user.email).toBe("john@example.com");
      expect(result.tokens.accessToken).toBe("access.token.mock");
      expect(result.tokens.refreshToken).toBe("refresh.token.mock");
    });

    it("deve lançar InvalidCredentialsError se usuário não existe", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      const input = {
        email: "nonexistent@example.com",
        password: "password",
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError);

      // Não deve verificar senha
      expect(passwordHasher.verify).not.toHaveBeenCalled();
    });

    it("deve lançar InvalidCredentialsError se senha está incorreta", async () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2b$10$hashedPassword",
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordHasher.verify).mockResolvedValue(false);

      const input = {
        email: "john@example.com",
        password: "wrongPassword",
      };

      await expect(sut.execute(input)).rejects.toThrow(InvalidCredentialsError);

      // Não deve gerar tokens
      expect(tokenService.signAccessToken).not.toHaveBeenCalled();
    });

    it("deve validar formato de email", async () => {
      const input = {
        email: "invalid-email",
        password: "password",
      };

      await expect(sut.execute(input)).rejects.toThrow();

      // Não deve buscar usuário
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("deve normalizar email para lowercase", async () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2b$10$hash",
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordHasher.verify).mockResolvedValue(true);

      const input = {
        email: "John@EXAMPLE.COM",
        password: "password",
      };

      await sut.execute(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
    });

    it("não deve retornar senha no output", async () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2b$10$hash",
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
      vi.mocked(passwordHasher.verify).mockResolvedValue(true);

      const input = {
        email: "john@example.com",
        password: "password",
      };

      const result = await sut.execute(input);

      expect(result.user).not.toHaveProperty("password");
      expect(result.user).not.toHaveProperty("passwordHash");
    });
  });
});
