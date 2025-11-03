import { describe, it, expect, beforeEach, vi } from "vitest";
import { RegisterUserUseCase } from "@app/use-cases/auth/register-user.use-case";
import { EmailAlreadyExistsError } from "@core/errors/email-already-exists-error";
import { User } from "@core/entities/user";
import type { UserRepository } from "@app/interfaces/user-repository";
import type { PasswordHasher } from "@app/interfaces/password-hasher";
import type { TokenService } from "@app/interfaces/token-service";

describe("RegisterUserUseCase (unit)", () => {
  let sut: RegisterUserUseCase;
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let tokenService: TokenService;

  beforeEach(() => {
    // Mock UserRepository
    userRepository = {
      create: vi.fn(),
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Mock PasswordHasher
    passwordHasher = {
      hash: vi.fn().mockResolvedValue("$2b$10$hashedPassword"),
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

    sut = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);
  });

  describe("execute()", () => {
    it("deve registrar um novo usuário com sucesso", async () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      const result = await sut.execute(input);

      // Verifica se buscou email existente
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );

      // Verifica se fez hash da senha
      expect(passwordHasher.hash).toHaveBeenCalledWith("SecurePass123!");

      // Verifica se criou o usuário
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: expect.objectContaining({ value: "john@example.com" }),
        })
      );

      // Verifica se gerou tokens
      expect(tokenService.signAccessToken).toHaveBeenCalled();
      expect(tokenService.issueRefreshToken).toHaveBeenCalled();

      // Verifica resposta
      expect(result.user.name).toBe("John Doe");
      expect(result.user.email).toBe("john@example.com");
      expect(result.tokens.accessToken).toBe("access.token.mock");
      expect(result.tokens.refreshToken).toBe("refresh.token.mock");
    });

    it("deve lançar EmailAlreadyExistsError se email já existe", async () => {
      const existingUser = User.create({
        name: "Existing",
        email: "john@example.com",
        passwordHash: "$2b$10$hash",
      });

      vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

      const input = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      await expect(sut.execute(input)).rejects.toThrow(EmailAlreadyExistsError);

      // Não deve tentar criar usuário
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("deve validar formato de email", async () => {
      const input = {
        name: "John Doe",
        email: "invalid-email",
        password: "SecurePass123!",
      };

      await expect(sut.execute(input)).rejects.toThrow();

      // Não deve tentar criar usuário
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("deve normalizar email para lowercase", async () => {
      const input = {
        name: "John Doe",
        email: "John@EXAMPLE.COM",
        password: "SecurePass123!",
      };

      const result = await sut.execute(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        "john@example.com"
      );
      expect(result.user.email).toBe("john@example.com");
    });

    it("deve gerar ID único para o usuário", async () => {
      const input = {
        name: "User 1",
        email: "user1@example.com",
        password: "password",
      };

      const result1 = await sut.execute(input);

      // Reset mocks
      vi.clearAllMocks();
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      const input2 = {
        name: "User 2",
        email: "user2@example.com",
        password: "password",
      };

      const result2 = await sut.execute(input2);

      expect(result1.user.id).not.toBe(result2.user.id);
    });

    it("não deve retornar senha no output", async () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123!",
      };

      const result = await sut.execute(input);

      expect(result.user).not.toHaveProperty("password");
      expect(result.user).not.toHaveProperty("passwordHash");
    });
  });
});
