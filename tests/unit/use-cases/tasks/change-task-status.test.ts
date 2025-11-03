import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChangeTaskStatusUseCase } from "@app/use-cases/tasks/change-task-status.use-case";
import { NotFoundError } from "@core/errors/not-found-error";
import { Task } from "@core/entities/task";
import type { TaskRepository } from "@app/interfaces/task-repository";

describe("ChangeTaskStatusUseCase (unit)", () => {
  let sut: ChangeTaskStatusUseCase;
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

    sut = new ChangeTaskStatusUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve marcar task como done", async () => {
      const pendingTask = Task.create({
        userId: "user-123",
        title: "Task pendente",
      });
      const doneTask = Task.create({
        userId: "user-123",
        title: "Task pendente",
      });
      doneTask.markAsDone();

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(doneTask);

      const input = {
        taskId: pendingTask.id,
        userId: "user-123",
        status: "done" as const,
      };

      const result = await sut.execute(input);

      // Verifica se chamou updateStatus
      expect(taskRepository.updateStatus).toHaveBeenCalledWith(
        pendingTask.id,
        "user-123",
        "done"
      );

      expect(result.task.status).toBe("done");
    });

    it("deve marcar task como pending", async () => {
      const doneTask = Task.create({
        userId: "user-123",
        title: "Task concluída",
      });
      doneTask.markAsDone();

      const pendingTask = Task.create({
        userId: "user-123",
        title: "Task concluída",
      });

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(pendingTask);

      const input = {
        taskId: doneTask.id,
        userId: "user-123",
        status: "pending" as const,
      };

      const result = await sut.execute(input);

      expect(taskRepository.updateStatus).toHaveBeenCalledWith(
        doneTask.id,
        "user-123",
        "pending"
      );

      expect(result.task.status).toBe("pending");
    });

    it("deve lançar NotFoundError se task não existe", async () => {
      vi.mocked(taskRepository.updateStatus).mockRejectedValue(
        new NotFoundError("Task not found")
      );

      const input = {
        taskId: "non-existent-id",
        userId: "user-123",
        status: "done" as const,
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
    });

    it("deve lançar NotFoundError se task não pertence ao usuário", async () => {
      vi.mocked(taskRepository.updateStatus).mockRejectedValue(
        new NotFoundError("Task not found or access denied")
      );

      const input = {
        taskId: "task-123",
        userId: "wrong-user-id",
        status: "done" as const,
      };

      await expect(sut.execute(input)).rejects.toThrow(NotFoundError);
    });

    it("deve validar ownership através do repository", async () => {
      const task = Task.create({
        userId: "user-123",
        title: "Task",
      });

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(task);

      const input = {
        taskId: task.id,
        userId: "user-123",
        status: "done" as const,
      };

      await sut.execute(input);

      // Repository deve receber userId para validar ownership
      expect(taskRepository.updateStatus).toHaveBeenCalledWith(
        task.id,
        "user-123",
        "done"
      );
    });

    it("não deve alterar outros campos da task", async () => {
      const task = Task.create({
        userId: "user-123",
        title: "Task original",
        description: "Descrição original",
        priority: "high",
      });
      task.markAsDone();

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(task);

      const input = {
        taskId: task.id,
        userId: "user-123",
        status: "done" as const,
      };

      const result = await sut.execute(input);

      // Outros campos devem permanecer inalterados
      expect(result.task.title).toBe("Task original");
      expect(result.task.description).toBe("Descrição original");
      expect(result.task.priority).toBe("high");
    });

    it("deve permitir toggle entre pending e done", async () => {
      const task = Task.create({
        userId: "user-123",
        title: "Task",
      });

      // Primeiro: pending -> done
      const doneTask = Task.create({
        userId: "user-123",
        title: "Task",
      });
      doneTask.markAsDone();

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(doneTask);

      const input1 = {
        taskId: task.id,
        userId: "user-123",
        status: "done" as const,
      };

      const result1 = await sut.execute(input1);
      expect(result1.task.status).toBe("done");

      // Segundo: done -> pending
      const pendingTask = Task.create({
        userId: "user-123",
        title: "Task",
      });

      vi.mocked(taskRepository.updateStatus).mockResolvedValue(pendingTask);

      const input2 = {
        taskId: task.id,
        userId: "user-123",
        status: "pending" as const,
      };

      const result2 = await sut.execute(input2);
      expect(result2.task.status).toBe("pending");
    });
  });
});
