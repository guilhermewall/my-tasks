import { DomainError } from "./domain-error";

export class NotFoundError extends DomainError {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} with identifier '${identifier}' not found`
      : `${entity} not found`;
    super(message);
    this.name = "NotFoundError";
  }
}
