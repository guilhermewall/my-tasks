import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetTaskByIdUseCase } from "@app/use-cases/tasks/get-task-by-id.use-case";
import { NotFoundError } from "@core/errors/not-found-error";
import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";

describe("GetTaskByIdUseCase (unit)", () => {
  let sut: GetTaskByIdUseCase;
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

    sut = new GetTaskByIdUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve buscar task por ID com sucesso", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Minha task",
        description: "Descrição da task",
        priority: "high",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      // Verifica se buscou com ownership
      expect(taskRepository.findByIdOwned).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );

      // Verifica resposta
      expect(result.task.id).toBe(existingTask.id);
      expect(result.task.userId).toBe("user-123");
      expect(result.task.title).toBe("Minha task");
      expect(result.task.description).toBe("Descrição da task");
      expect(result.task.priority).toBe("high");
      expect(result.task.status).toBe("pending");
    });

    it("deve retornar todos os campos da task", async () => {
      const dueDate = new Date("2025-12-31");
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task completa",
        description: "Descrição",
        priority: "medium",
        dueDate,
      });
      existingTask.markAsDone();

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(result.task).toEqual({
        id: existingTask.id,
        userId: "user-123",
        title: "Task completa",
        description: "Descrição",
        status: "done",
        priority: "medium",
        dueDate,
        createdAt: existingTask.createdAt,
        updatedAt: existingTask.updatedAt,
      });
    });

    it("deve lançar NotFoundError se task não existe", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "non-existent-id",
        userId: "user-123",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
    });

    it("deve lançar NotFoundError se task não pertence ao usuário", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "task-123",
        userId: "wrong-user-id",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
    });

    it("deve validar ownership através do repository", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      await sut.execute(input);

      // Deve buscar com userId para validar ownership
      expect(taskRepository.findByIdOwned).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );
    });

    it("deve retornar task com description null se não tiver", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task sem descrição",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(result.task.description).toBeNull();
    });

    it("deve retornar task com dueDate null se não tiver", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task sem prazo",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(result.task.dueDate).toBeNull();
    });
  });
});
