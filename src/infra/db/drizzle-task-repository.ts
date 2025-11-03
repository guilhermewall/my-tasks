import { eq, and, desc, asc, or, ilike, lt, gt } from "drizzle-orm";
import type {
  TaskRepository,
  ListTasksQuery,
} from "@app/interfaces/task-repository";
import { Task } from "@core/entities/task";
import { NotFoundError } from "@core/errors/not-found-error";
import type { Page, TaskStatus } from "@shared/types";
import { encodeCursor, decodeCursor } from "@shared/cursor";
import { db } from "@infra/db/connection";
import { tasks } from "@infra/db/schema";

/**
 * Implementação de TaskRepository usando Drizzle ORM
 * Suporta paginação cursor-based, filtros por status e busca de texto
 */
export class DrizzleTaskRepository implements TaskRepository {
  async create(task: Task): Promise<void> {
    const plainTask = task.toPlainObject();

    await db.insert(tasks).values({
      id: plainTask.id,
      userId: plainTask.userId,
      title: plainTask.title,
      description: plainTask.description || null,
      status: plainTask.status,
      priority: plainTask.priority,
      dueDate: plainTask.dueDate
        ? plainTask.dueDate.toISOString().split("T")[0]
        : null,
      createdAt: plainTask.createdAt,
      updatedAt: plainTask.updatedAt,
    });
  }

  async findByIdOwned(id: string, userId: string): Promise<Task | null> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async list(query: ListTasksQuery): Promise<Page<Task>> {
    const limit = query.limit || 20;
    const order = query.order || "desc";

    // Monta condições WHERE
    const conditions = [eq(tasks.userId, query.userId)];

    // Filtro por status
    if (query.status) {
      conditions.push(eq(tasks.status, query.status));
    }

    // Filtro por busca (title ou description)
    if (query.search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${query.search}%`),
          ilike(tasks.description, `%${query.search}%`)
        )!
      );
    }

    // Cursor-based pagination
    if (query.cursor) {
      try {
        const cursorData = decodeCursor(query.cursor);
        const cursorDate = new Date(cursorData.createdAt);

        // Adiciona condição para paginação
        if (order === "desc") {
          conditions.push(lt(tasks.createdAt, cursorDate));
        } else {
          conditions.push(gt(tasks.createdAt, cursorDate));
        }
      } catch {
        // Cursor inválido, ignora
      }
    }

    // Busca tasks (limit + 1 para saber se tem próxima página)
    const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(order === "desc" ? desc(tasks.createdAt) : asc(tasks.createdAt))
      .limit(limit + 1);

    // Verifica se tem próxima página
    const hasNextPage = rows.length > limit;
    const taskRows = hasNextPage ? rows.slice(0, limit) : rows;

    // Mapeia para entidades de domínio
    const taskEntities = taskRows.map((row) => this.toDomain(row));

    // Gera cursor para próxima página
    let nextCursor: string | null = null;
    if (hasNextPage && taskRows.length > 0) {
      const lastTask = taskRows.at(-1)!;
      nextCursor = encodeCursor({
        createdAt: lastTask.createdAt.toISOString(),
        id: lastTask.id,
      });
    }

    return {
      data: taskEntities,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async updateStatus(
    id: string,
    userId: string,
    status: TaskStatus
  ): Promise<Task> {
    // Busca a task para verificar ownership
    const task = await this.findByIdOwned(id, userId);
    if (!task) {
      throw new NotFoundError("Task not found or does not belong to user");
    }

    // Atualiza status usando método da entidade
    task.updateStatus(status);

    // Persiste
    await this.update(task);

    return task;
  }

  async update(task: Task): Promise<void> {
    const plainTask = task.toPlainObject();

    await db
      .update(tasks)
      .set({
        title: plainTask.title,
        description: plainTask.description || null,
        status: plainTask.status,
        priority: plainTask.priority,
        dueDate: plainTask.dueDate
          ? plainTask.dueDate.toISOString().split("T")[0]
          : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, plainTask.id));
  }

  async delete(id: string, userId: string): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  /**
   * Converte um registro do banco de dados para entidade de domínio Task
   * @param row - Registro do banco (tasks table)
   * @returns Entidade Task reconstituída
   */
  private toDomain(row: typeof tasks.$inferSelect): Task {
    return Task.reconstitute({
      id: row.id,
      userId: row.userId,
      title: row.title,
      description: row.description ?? null,
      status: row.status as TaskStatus,
      priority: row.priority,
      dueDate: row.dueDate ? new Date(row.dueDate) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
