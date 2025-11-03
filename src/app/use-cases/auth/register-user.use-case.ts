import { User } from "@core/entities/user";
import { Email } from "@core/value-objects/email";
import { PasswordHash } from "@core/value-objects/password-hash";
import { EmailAlreadyExistsError } from "@core/errors/email-already-exists-error";
import type { UserRepository } from "@app/interfaces/user-repository";
import type { PasswordHasher } from "@app/interfaces/password-hasher";
import type { TokenService, TokenPair } from "@app/interfaces/token-service";

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  tokens: TokenPair;
}

/**
 * Use Case: Registrar novo usuário
 *
 * Responsabilidades:
 * - Validar se email já está em uso
 * - Fazer hash da senha
 * - Criar entidade User
 * - Persistir no repositório
 * - Gerar tokens de autenticação
 *
 * @example
 * ```ts
 * const registerUser = new RegisterUserUseCase(userRepo, passwordHasher, tokenService);
 * const result = await registerUser.execute({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "SecurePass123!"
 * });
 * ```
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // 1. Valida formato do email (Value Object faz validação)
    const email = Email.create(input.email);

    // 2. Verifica se email já existe
    const existingUser = await this.userRepository.findByEmail(
      email.getValue()
    );

    if (existingUser) {
      throw new EmailAlreadyExistsError(email.getValue());
    }

    // 3. Faz hash da senha
    const hashedPassword = await this.passwordHasher.hash(input.password);
    const passwordHash = PasswordHash.create(hashedPassword);

    // 4. Cria entidade User
    const user = User.create({
      name: input.name,
      email: email.getValue(),
      passwordHash: passwordHash.getValue(),
    });

    // 5. Persiste no banco
    await this.userRepository.create(user);

    // 6. Gera tokens de autenticação
    const accessToken = this.tokenService.signAccessToken(user);
    const refreshToken = await this.tokenService.issueRefreshToken(user);

    const tokens: TokenPair = {
      accessToken,
      refreshToken,
    };

    // 7. Retorna usuário criado (sem senha) + tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        createdAt: user.createdAt,
      },
      tokens,
    };
  }
}
