import type {
  TaskRepository,
  ListTasksQuery,
} from "@app/interfaces/task-repository";

export interface ListUserTasksInput {
  userId: string;
  status?: "pending" | "done";
  search?: string;
  limit?: number;
  cursor?: string;
  order?: "asc" | "desc";
}

export interface ListUserTasksOutput {
  data: Array<{
    id: string;
    userId: string;
    title: string;
    description: string | null;
    status: "pending" | "done";
    priority: "low" | "medium" | "high";
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

/**
 * Use Case: Listar tasks do usuário
 *
 * Responsabilidades:
 * - Listar tasks do usuário com filtros opcionais
 * - Suportar paginação cursor-based
 * - Filtrar por status (pending/done)
 * - Buscar por texto (title/description)
 * - Ordenar por createdAt (asc/desc)
 *
 * @example
 * ```ts
 * const listUserTasks = new ListUserTasksUseCase(taskRepository);
 * const result = await listUserTasks.execute({
 *   userId: "user-id",
 *   status: "pending",
 *   limit: 10,
 *   order: "desc"
 * });
 * ```
 */
export class ListUserTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(input: ListUserTasksInput): Promise<ListUserTasksOutput> {
    // 1. Monta query com filtros
    const query: ListTasksQuery = {
      userId: input.userId,
      status: input.status,
      search: input.search,
      limit: input.limit ?? 20, // default 20 items
      cursor: input.cursor,
      order: input.order ?? "desc", // default desc (mais recentes primeiro)
    };

    // 2. Busca tasks do repositório
    const result = await this.taskRepository.list(query);

    // 3. Mapeia para output
    return {
      data: result.data.map((task) => ({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      pageInfo: result.pageInfo,
    };
  }
}
