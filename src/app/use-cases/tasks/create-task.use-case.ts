import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";

export interface CreateTaskInput {
  userId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
}

export interface CreateTaskOutput {
  task: {
    id: string;
    userId: string;
    title: string;
    description: string | null;
    status: "pending" | "done";
    priority: "low" | "medium" | "high";
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Use Case: Criar nova task
 *
 * Responsabilidades:
 * - Validar dados de entrada
 * - Criar entidade Task
 * - Persistir no repositório
 *
 * @example
 * ```ts
 * const createTask = new CreateTaskUseCase(taskRepository);
 * const result = await createTask.execute({
 *   userId: "user-id",
 *   title: "Comprar leite",
 *   priority: "high"
 * });
 * ```
 */
export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<CreateTaskOutput> {
    // 1. Cria entidade Task (validações no domain)
    const task = Task.create({
      userId: input.userId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
    });

    // 2. Persiste no banco
    await this.taskRepository.create(task);

    // 3. Retorna task criada
    return {
      task: {
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      },
    };
  }
}
