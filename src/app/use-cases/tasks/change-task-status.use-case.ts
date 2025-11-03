import type { TaskRepository } from "@app/interfaces/task-repository";

export interface ChangeTaskStatusInput {
  taskId: string;
  userId: string;
  status: "pending" | "done";
}

export interface ChangeTaskStatusOutput {
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
 * Use Case: Alterar status da task (pending/done)
 *
 * Responsabilidades:
 * - Validar ownership (usuário é dono da task)
 * - Alterar status via método do domain
 * - Persistir mudança
 *
 * @example
 * ```ts
 * const changeStatus = new ChangeTaskStatusUseCase(taskRepository);
 * const result = await changeStatus.execute({
 *   taskId: "task-id",
 *   userId: "user-id",
 *   status: "done"
 * });
 * ```
 */
export class ChangeTaskStatusUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ChangeTaskStatusInput): Promise<ChangeTaskStatusOutput> {
    // 1. Atualiza status (repository valida ownership e persiste)
    const task = await this.taskRepository.updateStatus(
      input.taskId,
      input.userId,
      input.status
    );

    // 2. Retorna task atualizada
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
