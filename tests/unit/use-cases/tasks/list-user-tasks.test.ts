import { describe, it, expect, beforeEach, vi } from "vitest";
import { ListUserTasksUseCase } from "@app/use-cases/tasks/list-user-tasks.use-case";
import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";
import type { Page } from "@shared/types";

describe("ListUserTasksUseCase (unit)", () => {
  let sut: ListUserTasksUseCase;
  let taskRepository: TaskRepository;

  beforeEach(() => {
    // Mock TaskRepository
    taskRepository = {
      create: vi.fn(),
      findByIdOwned: vi.fn(),
      list: vi.fn(),
      updateStatus: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    sut = new ListUserTasksUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve listar tasks do usuário", async () => {
      const task1 = Task.create({
        userId: "user-123",
        title: "Task 1",
      });
      const task2 = Task.create({
        userId: "user-123",
        title: "Task 2",
      });

      const mockResult: Page<Task> = {
        data: [task1, task2],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
      };

      const result = await sut.execute(input);

      // Verifica query padrão
      expect(taskRepository.list).toHaveBeenCalledWith({
        userId: "user-123",
        status: undefined,
        search: undefined,
        limit: 20, // default
        cursor: undefined,
        order: "desc", // default
      });

      // Verifica resposta
      expect(result.data).toHaveLength(2);
      expect(result.data[0].title).toBe("Task 1");
      expect(result.data[1].title).toBe("Task 2");
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it("deve filtrar por status", async () => {
      const pendingTask = Task.create({
        userId: "user-123",
        title: "Pending task",
      });

      const mockResult: Page<Task> = {
        data: [pendingTask],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        status: "pending" as const,
      };

      const result = await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
        })
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("pending");
    });

    it("deve buscar por texto", async () => {
      const task = Task.create({
        userId: "user-123",
        title: "Comprar leite",
      });

      const mockResult: Page<Task> = {
        data: [task],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        search: "leite",
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "leite",
        })
      );
    });

    it("deve respeitar limit customizado", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        limit: 5,
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
        })
      );
    });

    it("deve usar limit padrão de 20 se não fornecido", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20,
        })
      );
    });

    it("deve passar cursor para paginação", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        cursor: "eyJjcmVhdGVkQXQiOiIyMDI1In0=",
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: "eyJjcmVhdGVkQXQiOiIyMDI1In0=",
        })
      );
    });

    it("deve suportar ordenação ascendente", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        order: "asc" as const,
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          order: "asc",
        })
      );
    });

    it("deve usar order desc como padrão", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          order: "desc",
        })
      );
    });

    it("deve retornar pageInfo com hasNextPage", async () => {
      const task = Task.create({
        userId: "user-123",
        title: "Task",
      });

      const mockResult: Page<Task> = {
        data: [task],
        pageInfo: {
          hasNextPage: true,
          nextCursor: "cursor123",
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.nextCursor).toBe("cursor123");
    });

    it("deve combinar múltiplos filtros", async () => {
      const mockResult: Page<Task> = {
        data: [],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
        status: "done" as const,
        search: "importante",
        limit: 10,
        order: "asc" as const,
      };

      await sut.execute(input);

      expect(taskRepository.list).toHaveBeenCalledWith({
        userId: "user-123",
        status: "done",
        search: "importante",
        limit: 10,
        cursor: undefined,
        order: "asc",
      });
    });

    it("deve mapear todos os campos da task corretamente", async () => {
      const dueDate = new Date("2025-12-31");
      const task = Task.create({
        userId: "user-123",
        title: "Task completa",
        description: "Descrição detalhada",
        priority: "high",
        dueDate,
      });

      const mockResult: Page<Task> = {
        data: [task],
        pageInfo: {
          hasNextPage: false,
          nextCursor: null,
        },
      };

      vi.mocked(taskRepository.list).mockResolvedValue(mockResult);

      const input = {
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(result.data[0]).toEqual({
        id: task.id,
        userId: "user-123",
        title: "Task completa",
        description: "Descrição detalhada",
        status: "pending",
        priority: "high",
        dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });
  });
});
