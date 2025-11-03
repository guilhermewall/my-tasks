import { describe, it, expect } from "vitest";
import { updateTaskSchema } from "@interfaces/http/dtos/tasks/update-task.dto";

describe("UpdateTaskDTO", () => {
  describe("updateTaskSchema validation", () => {
    it("should accept partial update with title only", () => {
      const data = {
        title: "Updated title",
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Updated title");
      }
    });

    it("should accept partial update with description only", () => {
      const data = {
        description: "Updated description",
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Updated description");
      }
    });

    it("should accept partial update with priority only", () => {
      const data = {
        priority: "high" as const,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("high");
      }
    });

    it("should accept partial update with dueDate only", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const data = {
        dueDate: futureDate,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeInstanceOf(Date);
      }
    });

    it("should accept multiple fields for update", () => {
      const data = {
        title: "New title",
        priority: "low" as const,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("New title");
        expect(result.data.priority).toBe("low");
      }
    });

    it("should trim title and description", () => {
      const data = {
        title: "  Updated title  ",
        description: "  Updated description  ",
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Updated title");
        expect(result.data.description).toBe("Updated description");
      }
    });

    it("should accept null description to clear it", () => {
      const data = {
        description: null,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeNull();
      }
    });

    it("should accept null dueDate to clear it", () => {
      const data = {
        dueDate: null,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeNull();
      }
    });

    it("should reject empty object (no fields to update)", () => {
      const data = {};

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Pelo menos um campo deve ser informado para atualização"
        );
      }
    });

    it("should reject title with less than 3 characters", () => {
      const data = {
        title: "AB",
      };

      const result = updateTaskSchema.safeParse(data);
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

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Título deve ter no máximo 200 caracteres"
        );
      }
    });

    it("should reject description with more than 1000 characters", () => {
      const data = {
        description: "A".repeat(1001),
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Descrição deve ter no máximo 1000 caracteres"
        );
      }
    });

    it("should reject invalid priority", () => {
      const data = {
        priority: "urgent",
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Prioridade deve ser");
      }
    });

    it("should reject invalid date format", () => {
      const data = {
        dueDate: "invalid-date",
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("ISO 8601");
      }
    });

    it("should accept past date in update (no future validation)", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      const data = {
        dueDate: pastDate,
      };

      const result = updateTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeInstanceOf(Date);
      }
    });
  });
});
