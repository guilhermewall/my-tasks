import { NotFoundError } from "@core/errors/not-found-error";
import type { TaskRepository } from "@app/interfaces/task-repository";

export interface UpdateTaskInput {
  taskId: string;
  userId: string;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
}

export interface UpdateTaskOutput {
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
 * Use Case: Atualizar task existente
 *
 * Responsabilidades:
 * - Buscar task por ID
 * - Validar ownership (usuário é dono da task)
 * - Atualizar campos
 * - Persistir mudanças
 *
 * @example
 * ```ts
 * const updateTask = new UpdateTaskUseCase(taskRepository);
 * const result = await updateTask.execute({
 *   taskId: "task-id",
 *   userId: "user-id",
 *   title: "Novo título",
 *   priority: "high"
 * });
 * ```
 */
export class UpdateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: UpdateTaskInput): Promise<UpdateTaskOutput> {
    // 1. Busca task validando ownership
    const task = await this.taskRepository.findByIdOwned(
      input.taskId,
      input.userId
    );

    if (!task) {
      throw new NotFoundError("Task not found or access denied");
    }

    // 2. Atualiza campos se fornecidos
    if (input.title !== undefined) {
      task.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      task.updateDescription(input.description);
    }

    if (input.priority !== undefined) {
      task.updatePriority(input.priority);
    }

    if (input.dueDate !== undefined) {
      task.updateDueDate(input.dueDate);
    }

    // 3. Persiste mudanças
    await this.taskRepository.update(task);

    // 4. Retorna task atualizada
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
