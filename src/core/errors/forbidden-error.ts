import { DomainError } from "./domain-error";

export class ForbiddenError extends DomainError {
  constructor(message: string = "Access forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}
