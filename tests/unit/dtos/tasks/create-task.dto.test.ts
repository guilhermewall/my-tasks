import { describe, it, expect } from "vitest";
import { createTaskSchema } from "@interfaces/http/dtos/tasks/create-task.dto";

describe("CreateTaskDTO", () => {
  describe("createTaskSchema validation", () => {
    it("should accept valid task data with all fields", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const validData = {
        title: "Complete project",
        description: "Finish the todo API implementation",
        priority: "high" as const,
        dueDate: futureDate,
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Complete project");
        expect(result.data.description).toBe(
          "Finish the todo API implementation"
        );
        expect(result.data.priority).toBe("high");
        expect(result.data.dueDate).toBeInstanceOf(Date);
      }
    });

    it("should accept minimal task data with default priority", () => {
      const validData = {
        title: "Simple task",
      };

      const result = createTaskSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Simple task");
        expect(result.data.priority).toBe("medium"); // default
        expect(result.data.description).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
      }
    });

    it("should trim title", () => {
      const data = {
        title: "  Task with spaces  ",
      };

      const result = createTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Task with spaces");
      }
    });

    it("should trim description", () => {
      const data = {
        title: "Task",
        description: "  Description with spaces  ",
      };

      const result = createTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Description with spaces");
      }
    });

    describe("title validation", () => {
      it("should reject title with less than 3 characters", () => {
        const data = {
          title: "AB",
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Título deve ter no mínimo 3 caracteres"
          );
        }
      });

      it("should reject title with more than 200 characters", () => {
        const data = {
          title: "A".repeat(201),
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Título deve ter no máximo 200 caracteres"
          );
        }
      });

      it("should reject empty title after trim", () => {
        const data = {
          title: "   ",
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("description validation", () => {
      it("should accept null description", () => {
        const data = {
          title: "Task",
          description: null,
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.description).toBeNull();
        }
      });

      it("should reject description with more than 1000 characters", () => {
        const data = {
          title: "Task",
          description: "A".repeat(1001),
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Descrição deve ter no máximo 1000 caracteres"
          );
        }
      });
    });

    describe("priority validation", () => {
      it("should accept all valid priority values", () => {
        const priorities = ["low", "medium", "high"] as const;

        for (const priority of priorities) {
          const data = {
            title: "Task",
            priority,
          };

          const result = createTaskSchema.safeParse(data);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.priority).toBe(priority);
          }
        }
      });

      it("should reject invalid priority", () => {
        const data = {
          title: "Task",
          priority: "urgent",
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "Prioridade deve ser"
          );
        }
      });
    });

    describe("dueDate validation", () => {
      it("should accept future date", () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
        const data = {
          title: "Task",
          dueDate: futureDate,
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.dueDate).toBeInstanceOf(Date);
        }
      });

      it("should reject past date", () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day
        const data = {
          title: "Task",
          dueDate: pastDate,
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Data de vencimento deve ser no futuro"
          );
        }
      });

      it("should accept null dueDate", () => {
        const data = {
          title: "Task",
          dueDate: null,
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.dueDate).toBeNull();
        }
      });

      it("should reject invalid date format", () => {
        const data = {
          title: "Task",
          dueDate: "invalid-date",
        };

        const result = createTaskSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("ISO 8601");
        }
      });
    });

    it("should reject when title is missing", () => {
      const data = {
        description: "Task description",
      };

      const result = createTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
