import { NotFoundError } from "@core/errors/not-found-error";
import type { TaskRepository } from "@app/interfaces/task-repository";

export interface DeleteTaskInput {
  taskId: string;
  userId: string;
}

export interface DeleteTaskOutput {
  success: boolean;
}

/**
 * Use Case: Deletar task
 *
 * Responsabilidades:
 * - Validar ownership (usuário é dono da task)
 * - Deletar task do repositório
 *
 * @example
 * ```ts
 * const deleteTask = new DeleteTaskUseCase(taskRepository);
 * await deleteTask.execute({
 *   taskId: "task-id",
 *   userId: "user-id"
 * });
 * ```
 */
export class DeleteTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: DeleteTaskInput): Promise<DeleteTaskOutput> {
    // 1. Verifica se task existe e pertence ao usuário
    const task = await this.taskRepository.findByIdOwned(
      input.taskId,
      input.userId
    );

    if (!task) {
      throw new NotFoundError("Task not found or access denied");
    }

    // 2. Delete task
    await this.taskRepository.delete(input.taskId, input.userId);

    return { success: true };
  }
}
