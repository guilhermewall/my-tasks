import { DomainError } from "./domain-error";

export class AuthError extends DomainError {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}
