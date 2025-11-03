import { Email } from "@core/value-objects/email";
import { InvalidCredentialsError } from "@core/errors/invalid-credentials-error";
import type { UserRepository } from "@app/interfaces/user-repository";
import type { PasswordHasher } from "@app/interfaces/password-hasher";
import type { TokenService, TokenPair } from "@app/interfaces/token-service";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokens: TokenPair;
}

/**
 * Use Case: Autenticar usuário
 *
 * Responsabilidades:
 * - Buscar usuário por email
 * - Verificar senha
 * - Gerar tokens de autenticação
 *
 * @example
 * ```ts
 * const loginUser = new LoginUserUseCase(userRepo, passwordHasher, tokenService);
 * const result = await loginUser.execute({
 *   email: "john@example.com",
 *   password: "SecurePass123!"
 * });
 * ```
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // 1. Valida formato do email
    const email = Email.create(input.email);

    // 2. Busca usuário por email
    const user = await this.userRepository.findByEmail(email.getValue());

    if (!user) {
      throw new InvalidCredentialsError();
    }

    // 3. Verifica senha
    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash.getValue()
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // 4. Gera tokens de autenticação
    const accessToken = this.tokenService.signAccessToken(user);
    const refreshToken = await this.tokenService.issueRefreshToken(user);

    const tokens: TokenPair = {
      accessToken,
      refreshToken,
    };

    // 5. Retorna usuário (sem senha) + tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
      },
      tokens,
    };
  }
}
