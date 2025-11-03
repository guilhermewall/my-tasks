import { describe, it, expect } from "vitest";
import { loginSchema } from "@interfaces/http/dtos/auth/login.dto";

describe("LoginDTO", () => {
  describe("loginSchema validation", () => {
    it("should accept valid login data", () => {
      const validData = {
        email: "john@example.com",
        password: "any-password",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
        expect(result.data.password).toBe("any-password");
      }
    });

    it("should normalize email to lowercase", () => {
      const data = {
        email: "John@EXAMPLE.COM",
        password: "any-password",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should trim email", () => {
      const data = {
        email: "  john@example.com  ",
        password: "any-password",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should reject invalid email format", () => {
      const data = {
        email: "invalid-email",
        password: "any-password",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email inválido");
      }
    });

    it("should reject empty password", () => {
      const data = {
        email: "john@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Senha é obrigatória");
      }
    });

    it("should reject when email is missing", () => {
      const data = {
        password: "any-password",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject when password is missing", () => {
      const data = {
        email: "john@example.com",
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept any password format for login", () => {
      // Login doesn't validate password strength, only that it exists
      const weakPasswords = ["123", "abc", "a", "12345678", "password"];

      for (const password of weakPasswords) {
        const data = {
          email: "john@example.com",
          password,
        };

        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });
});
