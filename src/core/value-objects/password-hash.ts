import { ValidationError } from "../errors";

export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(hash: string): PasswordHash {
    if (!hash || hash.trim().length === 0) {
      throw new ValidationError("Password hash cannot be empty");
    }

    // Bcrypt hashes têm formato específico: $2a$, $2b$, etc
    if (!hash.startsWith("$2")) {
      throw new ValidationError("Invalid password hash format");
    }

    return new PasswordHash(hash);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PasswordHash): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return "[REDACTED]"; // Nunca expor o hash em logs
  }
}
