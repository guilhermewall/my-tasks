import type { Task } from "@core/entities/task";
import type { Page, TaskStatus } from "@shared/types";

export interface ListTasksQuery {
  userId: string;
  status?: TaskStatus;
  search?: string;
  order?: "asc" | "desc";
  limit?: number;
  cursor?: string;
}

/**
 * Interface de repositório para persistência de tasks
 * Implementações: DrizzleTaskRepository (infra/db)
 */
export interface TaskRepository {
  /**
   * Cria uma nova task no banco de dados
   * @param task - Entidade Task a ser persistida
   * @returns void
   */
  create(task: Task): Promise<void>;

  /**
   * Busca uma task pelo ID que pertence ao usuário
   * @param id - UUID da task
   * @param userId - UUID do usuário (owner)
   * @returns Task encontrada ou null
   */
  findByIdOwned(id: string, userId: string): Promise<Task | null>;

  /**
   * Lista tasks do usuário com filtros e paginação cursor
   * @param query - Filtros de busca e paginação
   * @returns Página de tasks
   */
  list(query: ListTasksQuery): Promise<Page<Task>>;

  /**
   * Atualiza o status de uma task
   * @param id - UUID da task
   * @param userId - UUID do usuário (owner)
   * @param status - Novo status
   * @returns Task atualizada
   * @throws NotFoundError se task não existir ou não pertencer ao usuário
   */
  updateStatus(id: string, userId: string, status: TaskStatus): Promise<Task>;

  /**
   * Atualiza uma task completa
   * @param task - Entidade Task atualizada
   * @returns void
   */
  update(task: Task): Promise<void>;

  /**
   * Deleta uma task pelo ID
   * @param id - UUID da task
   * @param userId - UUID do usuário (owner)
   * @returns void (idempotente - não lança erro se não existir)
   */
  delete(id: string, userId: string): Promise<void>;
}
