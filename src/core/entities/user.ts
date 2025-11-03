import { Email, PasswordHash } from "../value-objects";
import { ValidationError } from "../errors";

export interface UserProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: PasswordHash;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  name: string;
  email: string;
  passwordHash: string;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(data: CreateUserProps, id?: string): User {
    // Validar nome
    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new ValidationError("Name cannot be empty", "name");
    }
    if (trimmedName.length < 1 || trimmedName.length > 120) {
      throw new ValidationError(
        "Name must be between 1 and 120 characters",
        "name"
      );
    }

    // Criar value objects
    const email = Email.create(data.email);
    const passwordHash = PasswordHash.create(data.passwordHash);

    const now = new Date();

    return new User({
      id: id || crypto.randomUUID(),
      name: trimmedName,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Métodos
  updateName(newName: string): void {
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new ValidationError("Name cannot be empty", "name");
    }
    if (trimmed.length < 1 || trimmed.length > 120) {
      throw new ValidationError(
        "Name must be between 1 and 120 characters",
        "name"
      );
    }

    this.props.name = trimmed;
    this.props.updatedAt = new Date();
  }

  updatePassword(newPasswordHash: string): void {
    this.props.passwordHash = PasswordHash.create(newPasswordHash);
    this.props.updatedAt = new Date();
  }

  toPlainObject() {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email.getValue(),
      passwordHash: this.props.passwordHash.getValue(),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
