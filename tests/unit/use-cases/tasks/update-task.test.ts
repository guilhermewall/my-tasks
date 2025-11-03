import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateTaskUseCase } from "@app/use-cases/tasks/update-task.use-case";
import { NotFoundError } from "@core/errors/not-found-error";
import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";

describe("UpdateTaskUseCase (unit)", () => {
  let sut: UpdateTaskUseCase;
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

    sut = new UpdateTaskUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve atualizar título da task", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Título antigo",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        title: "Título novo",
      };

      const result = await sut.execute(input);

      // Verifica se buscou a task com ownership
      expect(taskRepository.findByIdOwned).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );

      // Verifica se atualizou
      expect(taskRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Título novo",
        })
      );

      expect(result.task.title).toBe("Título novo");
    });

    it("deve atualizar description", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        description: "Nova descrição",
      };

      const result = await sut.execute(input);

      expect(result.task.description).toBe("Nova descrição");
    });

    it("deve atualizar priority", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task",
        priority: "low",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        priority: "high" as const,
      };

      const result = await sut.execute(input);

      expect(result.task.priority).toBe("high");
    });

    it("deve atualizar dueDate", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const newDueDate = new Date("2025-12-31");
      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        dueDate: newDueDate,
      };

      const result = await sut.execute(input);

      expect(result.task.dueDate).toEqual(newDueDate);
    });

    it("deve atualizar múltiplos campos ao mesmo tempo", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task antiga",
        priority: "low",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const newDueDate = new Date("2025-12-31");
      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        title: "Task nova",
        description: "Descrição completa",
        priority: "high" as const,
        dueDate: newDueDate,
      };

      const result = await sut.execute(input);

      expect(result.task.title).toBe("Task nova");
      expect(result.task.description).toBe("Descrição completa");
      expect(result.task.priority).toBe("high");
      expect(result.task.dueDate).toEqual(newDueDate);
    });

    it("deve lançar NotFoundError se task não existe", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "non-existent-id",
        userId: "user-123",
        title: "Novo título",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it("deve lançar NotFoundError se task não pertence ao usuário", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "task-123",
        userId: "wrong-user-id",
        title: "Novo título",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it("deve permitir atualização parcial (só alguns campos)", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Título original",
        description: "Descrição original",
        priority: "medium",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        priority: "high" as const,
      };

      const result = await sut.execute(input);

      // Campos não atualizados devem permanecer iguais
      expect(result.task.title).toBe("Título original");
      expect(result.task.description).toBe("Descrição original");
      expect(result.task.priority).toBe("high");
    });

    it("não deve alterar o status da task", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task",
      });
      existingTask.markAsDone();

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
        title: "Novo título",
      };

      const result = await sut.execute(input);

      // Status deve permanecer "done"
      expect(result.task.status).toBe("done");
    });
  });
});
