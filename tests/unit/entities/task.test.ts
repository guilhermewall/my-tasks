import { describe, it, expect } from "vitest";
import { Task } from "@core/entities/task";
import { ValidationError } from "@core/errors";

describe("Task Entity", () => {
  const userId = crypto.randomUUID();

  const validTaskData = {
    userId,
    title: "Complete project documentation",
    description: "Write comprehensive docs for the API",
    priority: "high" as const,
  };

  describe("create", () => {
    it("should create a valid task", () => {
      const task = Task.create(validTaskData);

      expect(task.id).toBeDefined();
      expect(task.userId).toBe(userId);
      expect(task.title).toBe("Complete project documentation");
      expect(task.description).toBe("Write comprehensive docs for the API");
      expect(task.status).toBe("pending");
      expect(task.priority).toBe("high");
      expect(task.dueDate).toBeNull();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it("should create task with custom id", () => {
      const customId = crypto.randomUUID();
      const task = Task.create(validTaskData, customId);

      expect(task.id).toBe(customId);
    });

    it("should create task with default priority medium", () => {
      const task = Task.create({
        userId,
        title: "Test task",
      });

      expect(task.priority).toBe("medium");
    });

    it("should trim whitespace from title", () => {
      const task = Task.create({
        userId,
        title: "  Test Task  ",
      });

      expect(task.title).toBe("Test Task");
    });

    it("should handle null description", () => {
      const task = Task.create({
        userId,
        title: "Test",
        description: null,
      });

      expect(task.description).toBeNull();
    });

    it("should trim and handle empty description", () => {
      const task = Task.create({
        userId,
        title: "Test",
        description: "   ",
      });

      expect(task.description).toBeNull();
    });

    it("should throw ValidationError for empty title", () => {
      expect(() => Task.create({ ...validTaskData, title: "" })).toThrow(
        ValidationError
      );
      expect(() => Task.create({ ...validTaskData, title: "   " })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for title too long", () => {
      const longTitle = "a".repeat(201);
      expect(() => Task.create({ ...validTaskData, title: longTitle })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for description too long", () => {
      const longDesc = "a".repeat(5001);
      expect(() =>
        Task.create({ ...validTaskData, description: longDesc })
      ).toThrow(ValidationError);
    });

    it("should throw ValidationError for empty userId", () => {
      expect(() => Task.create({ ...validTaskData, userId: "" })).toThrow(
        ValidationError
      );
      expect(() => Task.create({ ...validTaskData, userId: "   " })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for due date in the past", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(() =>
        Task.create({ ...validTaskData, dueDate: yesterday })
      ).toThrow(ValidationError);
    });

    it("should accept due date today or in the future", () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(() =>
        Task.create({ ...validTaskData, dueDate: today })
      ).not.toThrow();
      expect(() =>
        Task.create({ ...validTaskData, dueDate: tomorrow })
      ).not.toThrow();
    });
  });

  describe("updateTitle", () => {
    it("should update title successfully", () => {
      const task = Task.create(validTaskData);
      task.updateTitle("New Title");

      expect(task.title).toBe("New Title");
    });

    it("should trim whitespace when updating", () => {
      const task = Task.create(validTaskData);
      task.updateTitle("  New Title  ");

      expect(task.title).toBe("New Title");
    });

    it("should throw ValidationError for empty title", () => {
      const task = Task.create(validTaskData);
      expect(() => task.updateTitle("")).toThrow(ValidationError);
    });
  });

  describe("updateDescription", () => {
    it("should update description successfully", () => {
      const task = Task.create(validTaskData);
      task.updateDescription("New description");

      expect(task.description).toBe("New description");
    });

    it("should accept null description", () => {
      const task = Task.create(validTaskData);
      task.updateDescription(null);

      expect(task.description).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("should update status to done", () => {
      const task = Task.create(validTaskData);
      task.updateStatus("done");

      expect(task.status).toBe("done");
    });

    it("should update status to pending", () => {
      const task = Task.create(validTaskData);
      task.updateStatus("done");
      task.updateStatus("pending");

      expect(task.status).toBe("pending");
    });

    it("should throw ValidationError for invalid status", () => {
      const task = Task.create(validTaskData);
      expect(() => task.updateStatus("invalid" as any)).toThrow(
        ValidationError
      );
    });
  });

  describe("markAsDone", () => {
    it("should mark task as done", () => {
      const task = Task.create(validTaskData);
      task.markAsDone();

      expect(task.status).toBe("done");
    });
  });

  describe("markAsPending", () => {
    it("should mark task as pending", () => {
      const task = Task.create(validTaskData);
      task.markAsDone();
      task.markAsPending();

      expect(task.status).toBe("pending");
    });
  });

  describe("updatePriority", () => {
    it("should update priority successfully", () => {
      const task = Task.create(validTaskData);
      task.updatePriority("low");

      expect(task.priority).toBe("low");
    });

    it("should throw ValidationError for invalid priority", () => {
      const task = Task.create(validTaskData);
      expect(() => task.updatePriority("invalid" as any)).toThrow(
        ValidationError
      );
    });
  });

  describe("updateDueDate", () => {
    it("should update due date successfully", () => {
      const task = Task.create(validTaskData);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      task.updateDueDate(tomorrow);

      expect(task.dueDate).toEqual(tomorrow);
    });

    it("should accept null due date", () => {
      const task = Task.create(validTaskData);
      task.updateDueDate(null);

      expect(task.dueDate).toBeNull();
    });

    it("should throw ValidationError for past date", () => {
      const task = Task.create(validTaskData);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(() => task.updateDueDate(yesterday)).toThrow(ValidationError);
    });
  });

  describe("isOverdue", () => {
    it("should return false for task without due date", () => {
      const task = Task.create(validTaskData);
      expect(task.isOverdue()).toBe(false);
    });

    it("should return false for completed task", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Usar reconstitute para criar task com data passada (simulando dado do DB)
      const task = Task.reconstitute({
        id: crypto.randomUUID(),
        userId,
        title: "Test",
        description: null,
        status: "done",
        priority: "medium",
        dueDate: yesterday,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(task.isOverdue()).toBe(false);
    });

    it("should return false for future due date", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const task = Task.create({ ...validTaskData, dueDate: tomorrow });
      expect(task.isOverdue()).toBe(false);
    });
  });

  describe("belongsTo", () => {
    it("should return true for owner", () => {
      const task = Task.create(validTaskData);
      expect(task.belongsTo(userId)).toBe(true);
    });

    it("should return false for non-owner", () => {
      const task = Task.create(validTaskData);
      const otherUserId = crypto.randomUUID();
      expect(task.belongsTo(otherUserId)).toBe(false);
    });
  });

  describe("toPlainObject", () => {
    it("should convert task to plain object", () => {
      const task = Task.create(validTaskData);
      const plain = task.toPlainObject();

      expect(plain).toEqual({
        id: task.id,
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    });
  });
});
