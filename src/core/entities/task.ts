import { ValidationError } from "../errors";
import type { TaskStatus, TaskPriority } from "@shared/types";

export interface TaskProps {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskProps {
  userId: string;
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export class Task {
  private constructor(private readonly props: TaskProps) {}

  static create(data: CreateTaskProps, id?: string): Task {
    // Validar título
    const trimmedTitle = data.title.trim();
    if (!trimmedTitle) {
      throw new ValidationError("Title cannot be empty", "title");
    }
    if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
      throw new ValidationError(
        "Title must be between 1 and 200 characters",
        "title"
      );
    }

    // Validar descrição se fornecida
    let description = data.description || null;
    if (description) {
      const trimmedDesc = description.trim();
      description = trimmedDesc || null;
      if (description && description.length > 5000) {
        throw new ValidationError(
          "Description is too long (max 5000 characters)",
          "description"
        );
      }
    }

    // Validar userId
    if (!data.userId || data.userId.trim().length === 0) {
      throw new ValidationError("User ID is required", "userId");
    }

    // Validar dueDate se fornecida
    if (data.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(data.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        throw new ValidationError("Due date cannot be in the past", "dueDate");
      }
    }

    const now = new Date();

    return new Task({
      id: id || crypto.randomUUID(),
      userId: data.userId.trim(),
      title: trimmedTitle,
      description,
      status: "pending",
      priority: data.priority || "medium",
      dueDate: data.dueDate || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get priority(): TaskPriority {
    return this.props.priority;
  }

  get dueDate(): Date | null {
    return this.props.dueDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Métodos de negócio
  updateTitle(newTitle: string): void {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      throw new ValidationError("Title cannot be empty", "title");
    }
    if (trimmed.length < 1 || trimmed.length > 200) {
      throw new ValidationError(
        "Title must be between 1 and 200 characters",
        "title"
      );
    }

    this.props.title = trimmed;
    this.props.updatedAt = new Date();
  }

  updateDescription(newDescription: string | null): void {
    let description = newDescription;
    if (description) {
      const trimmed = description.trim();
      description = trimmed || null;
      if (description && description.length > 5000) {
        throw new ValidationError(
          "Description is too long (max 5000 characters)",
          "description"
        );
      }
    }

    this.props.description = description;
    this.props.updatedAt = new Date();
  }

  updateStatus(newStatus: TaskStatus): void {
    if (newStatus !== "pending" && newStatus !== "done") {
      throw new ValidationError(
        'Invalid status. Must be "pending" or "done"',
        "status"
      );
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  markAsDone(): void {
    this.updateStatus("done");
  }

  markAsPending(): void {
    this.updateStatus("pending");
  }

  updatePriority(newPriority: TaskPriority): void {
    if (
      newPriority !== "low" &&
      newPriority !== "medium" &&
      newPriority !== "high"
    ) {
      throw new ValidationError(
        'Invalid priority. Must be "low", "medium" or "high"',
        "priority"
      );
    }

    this.props.priority = newPriority;
    this.props.updatedAt = new Date();
  }

  updateDueDate(newDueDate: Date | null): void {
    if (newDueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(newDueDate);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        throw new ValidationError("Due date cannot be in the past", "dueDate");
      }
    }

    this.props.dueDate = newDueDate;
    this.props.updatedAt = new Date();
  }

  isOverdue(): boolean {
    if (!this.props.dueDate || this.props.status === "done") {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(this.props.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }

  toPlainObject() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      title: this.props.title,
      description: this.props.description,
      status: this.props.status,
      priority: this.props.priority,
      dueDate: this.props.dueDate,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
