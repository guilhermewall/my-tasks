import { ConflictError } from "./conflict-error";

/**
 * Error quando email já está cadastrado no sistema
 */
export class EmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Email ${email} is already registered`);
    this.name = "EmailAlreadyExistsError";
  }
}
