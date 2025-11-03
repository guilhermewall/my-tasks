import { AuthError } from "./auth-error";

/**
 * Error quando credenciais (email/senha) são inválidas
 */
export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}
