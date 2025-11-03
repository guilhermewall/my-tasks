import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateTaskUseCase } from "@app/use-cases/tasks/create-task.use-case";
import type { TaskRepository } from "@app/interfaces/task-repository";

describe("CreateTaskUseCase (unit)", () => {
  let sut: CreateTaskUseCase;
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

    sut = new CreateTaskUseCase(taskRepository);
  });

  describe("execute()", () => {
    it("deve criar uma task com dados mínimos", async () => {
      const input = {
        userId: "user-123",
        title: "Comprar leite",
      };

      const result = await sut.execute(input);

      // Verifica se criou no repositório
      expect(taskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          title: "Comprar leite",
          status: "pending",
          priority: "medium", // default
        })
      );

      // Verifica resposta
      expect(result.task.userId).toBe("user-123");
      expect(result.task.title).toBe("Comprar leite");
      expect(result.task.status).toBe("pending");
      expect(result.task.priority).toBe("medium");
      expect(result.task.description).toBeNull();
      expect(result.task.dueDate).toBeNull();
      expect(result.task.id).toBeDefined();
      expect(result.task.createdAt).toBeInstanceOf(Date);
      expect(result.task.updatedAt).toBeInstanceOf(Date);
    });

    it("deve criar task com todos os campos opcionais", async () => {
      const dueDate = new Date("2025-12-31");
      const input = {
        userId: "user-123",
        title: "Task completa",
        description: "Descrição detalhada",
        priority: "high" as const,
        dueDate,
      };

      const result = await sut.execute(input);

      expect(taskRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Task completa",
          description: "Descrição detalhada",
          priority: "high",
          dueDate,
        })
      );

      expect(result.task.description).toBe("Descrição detalhada");
      expect(result.task.priority).toBe("high");
      expect(result.task.dueDate).toEqual(dueDate);
    });

    it("deve gerar ID único para cada task", async () => {
      const input1 = {
        userId: "user-123",
        title: "Task 1",
      };

      const input2 = {
        userId: "user-123",
        title: "Task 2",
      };

      const result1 = await sut.execute(input1);
      const result2 = await sut.execute(input2);

      expect(result1.task.id).not.toBe(result2.task.id);
    });

    it("deve lançar erro se título for vazio", async () => {
      const input = {
        userId: "user-123",
        title: "",
      };

      await expect(sut.execute(input)).rejects.toThrow();
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it("deve lançar erro se título tiver apenas espaços", async () => {
      const input = {
        userId: "user-123",
        title: "   ",
      };

      await expect(sut.execute(input)).rejects.toThrow();
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it("deve validar priority como low, medium ou high", async () => {
      const validPriorities = ["low", "medium", "high"] as const;

      for (const priority of validPriorities) {
        const input = {
          userId: "user-123",
          title: `Task ${priority}`,
          priority,
        };

        const result = await sut.execute(input);
        expect(result.task.priority).toBe(priority);
      }
    });

    it("deve criar task com status pending por padrão", async () => {
      const input = {
        userId: "user-123",
        title: "Nova task",
      };

      const result = await sut.execute(input);

      expect(result.task.status).toBe("pending");
    });
  });
});
