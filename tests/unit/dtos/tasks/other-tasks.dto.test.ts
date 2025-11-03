import { describe, it, expect } from "vitest";
import {
  changeTaskStatusSchema,
  listTasksSchema,
  getTaskSchema,
  deleteTaskSchema,
} from "@interfaces/http/dtos/tasks";

describe("Task DTOs", () => {
  describe("changeTaskStatusSchema validation", () => {
    it("should accept pending status", () => {
      const data = { status: "pending" as const };

      const result = changeTaskStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
      }
    });

    it("should accept done status", () => {
      const data = { status: "done" as const };

      const result = changeTaskStatusSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("done");
      }
    });

    it("should reject invalid status", () => {
      const data = { status: "in-progress" };

      const result = changeTaskStatusSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Status deve ser");
      }
    });

    it("should reject when status is missing", () => {
      const data = {};

      const result = changeTaskStatusSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("listTasksSchema validation", () => {
    it("should accept list with default values", () => {
      const data = {};

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20); // default
        expect(result.data.order).toBe("desc"); // default
      }
    });

    it("should accept list with status filter", () => {
      const data = { status: "done" as const };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("done");
      }
    });

    it("should accept list with search filter", () => {
      const data = { search: "project" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("project");
      }
    });

    it("should trim search filter", () => {
      const data = { search: "  project  " };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("project");
      }
    });

    it("should accept custom limit", () => {
      const data = { limit: 50 };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it("should accept cursor for pagination", () => {
      const data = { cursor: "eyJjcmVhdGVkQXQiOiIyMDI0In0=" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cursor).toBe("eyJjcmVhdGVkQXQiOiIyMDI0In0=");
      }
    });

    it("should accept asc order", () => {
      const data = { order: "asc" as const };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe("asc");
      }
    });

    it("should accept all filters combined", () => {
      const data = {
        status: "pending" as const,
        search: "important",
        limit: 10,
        cursor: "abc123",
        order: "asc" as const,
      };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe("pending");
        expect(result.data.search).toBe("important");
        expect(result.data.limit).toBe(10);
        expect(result.data.cursor).toBe("abc123");
        expect(result.data.order).toBe("asc");
      }
    });

    it("should reject limit less than 1", () => {
      const data = { limit: 0 };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Limit deve ser no mínimo 1"
        );
      }
    });

    it("should reject limit greater than 100", () => {
      const data = { limit: 101 };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Limit deve ser no máximo 100"
        );
      }
    });

    it("should reject invalid status", () => {
      const data = { status: "completed" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid order", () => {
      const data = { order: "random" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject empty search string", () => {
      const data = { search: "" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Busca deve ter no mínimo 1 caractere"
        );
      }
    });

    it("should reject empty cursor", () => {
      const data = { cursor: "" };

      const result = listTasksSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Cursor inválido");
      }
    });
  });

  describe("getTaskSchema validation", () => {
    it("should accept valid UUID", () => {
      const data = { id: "123e4567-e89b-12d3-a456-426614174000" };

      const result = getTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("123e4567-e89b-12d3-a456-426614174000");
      }
    });

    it("should reject invalid UUID", () => {
      const data = { id: "not-a-uuid" };

      const result = getTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ID deve ser um UUID válido"
        );
      }
    });

    it("should reject when id is missing", () => {
      const data = {};

      const result = getTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteTaskSchema validation", () => {
    it("should accept valid UUID", () => {
      const data = { id: "123e4567-e89b-12d3-a456-426614174000" };

      const result = deleteTaskSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("123e4567-e89b-12d3-a456-426614174000");
      }
    });

    it("should reject invalid UUID", () => {
      const data = { id: "invalid-uuid" };

      const result = deleteTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "ID deve ser um UUID válido"
        );
      }
    });

    it("should reject when id is missing", () => {
      const data = {};

      const result = deleteTaskSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
