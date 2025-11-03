import bcrypt from "bcryptjs";
import type { PasswordHasher } from "@app/interfaces/password-hasher";
import { env } from "@infra/config/env";

/**
 * Implementação de PasswordHasher usando bcrypt
 * Cost factor configurável via variável de ambiente BCRYPT_COST
 */
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds: number;

  constructor(rounds?: number) {
    this.rounds = rounds ?? env.BCRYPT_COST;
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
