import { AuthError } from "./auth-error";

/**
 * Error quando token JWT é inválido, expirado ou revogado
 */
export class InvalidTokenError extends AuthError {
  constructor() {
    super("Invalid or expired token");
    this.name = "InvalidTokenError";
  }
}
