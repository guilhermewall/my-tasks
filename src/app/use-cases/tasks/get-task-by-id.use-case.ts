import { NotFoundError } from "@core/errors/not-found-error";
import type { TaskRepository } from "@app/interfaces/task-repository";

export interface GetTaskByIdInput {
  taskId: string;
  userId: string;
}

export interface GetTaskByIdOutput {
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
 * Use Case: Buscar task por ID
 *
 * Responsabilidades:
 * - Buscar task por ID
 * - Validar ownership (usuário é dono da task)
 * - Retornar dados completos da task
 *
 * @example
 * ```ts
 * const getTaskById = new GetTaskByIdUseCase(taskRepository);
 * const result = await getTaskById.execute({
 *   taskId: "task-id",
 *   userId: "user-id"
 * });
 * ```
 */
export class GetTaskByIdUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: GetTaskByIdInput): Promise<GetTaskByIdOutput> {
    // 1. Busca task validando ownership
    const task = await this.taskRepository.findByIdOwned(
      input.taskId,
      input.userId
    );

    if (!task) {
      throw new NotFoundError("Task not found or access denied");
    }

    // 2. Retorna task
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
