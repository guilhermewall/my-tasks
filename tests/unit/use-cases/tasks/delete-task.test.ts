import { describe, it, expect, beforeEach, vi } from "vitest";
import { DeleteTaskUseCase } from "@app/use-cases/tasks/delete-task.use-case";
import { NotFoundError } from "@core/errors/not-found-error";
import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";

describe("DeleteTaskUseCase (unit)", () => {
  let sut: DeleteTaskUseCase;
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

    sut = new DeleteTaskUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve deletar task com sucesso", async () => {
      const existingTask = Task.create({
        userId: "user-123",
        title: "Task a deletar",
      });

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(existingTask);

      const input = {
        taskId: existingTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      // Verifica se buscou a task com ownership
      expect(taskRepository.findByIdOwned).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );

      // Verifica se deletou
      expect(taskRepository.delete).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );

      expect(result.success).toBe(true);
    });

    it("deve lançar NotFoundError se task não existe", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "non-existent-id",
        userId: "user-123",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });

    it("deve lançar NotFoundError se task não pertence ao usuário", async () => {
      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(null);

      const input = {
        taskId: "task-123",
        userId: "wrong-user-id",
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });

    it("deve validar ownership antes de deletar", async () => {
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

      // Deve buscar com userId correto
      expect(taskRepository.findByIdOwned).toHaveBeenCalledWith(
        existingTask.id,
        "user-123"
      );
    });

    it("deve deletar task independente do status", async () => {
      const doneTask = Task.create({
        userId: "user-123",
        title: "Task concluída",
      });
      doneTask.markAsDone();

      vi.mocked(taskRepository.findByIdOwned).mockResolvedValue(doneTask);

      const input = {
        taskId: doneTask.id,
        userId: "user-123",
      };

      const result = await sut.execute(input);

      expect(taskRepository.delete).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
