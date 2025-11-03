import { describe, it, expect } from "vitest";
import { registerSchema } from "@interfaces/http/dtos/auth/register.dto";

describe("RegisterDTO", () => {
  describe("registerSchema validation", () => {
    it("should accept valid registration data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Test@123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com");
        expect(result.data.password).toBe("Test@123");
      }
    });

    it("should normalize email to lowercase", () => {
      const data = {
        name: "John Doe",
        email: "John@EXAMPLE.COM",
        password: "Test@123",
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should trim name and email", () => {
      const data = {
        name: "  John Doe  ",
        email: "  john@example.com  ",
        password: "Test@123",
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john@example.com");
      }
    });

    describe("name validation", () => {
      it("should reject name with less than 2 characters", () => {
        const data = {
          name: "J",
          email: "john@example.com",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Nome deve ter no mínimo 2 caracteres"
          );
        }
      });

      it("should reject name with more than 100 characters", () => {
        const data = {
          name: "J".repeat(101),
          email: "john@example.com",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Nome deve ter no máximo 100 caracteres"
          );
        }
      });
    });

    describe("email validation", () => {
      it("should reject invalid email format", () => {
        const data = {
          name: "John Doe",
          email: "invalid-email",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe("Email inválido");
        }
      });

      it("should reject email without domain", () => {
        const data = {
          name: "John Doe",
          email: "john@",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("password validation", () => {
      it("should reject password with less than 8 characters", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "Test@1",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Senha deve ter no mínimo 8 caracteres"
          );
        }
      });

      it("should reject password without uppercase letter", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("letra maiúscula");
        }
      });

      it("should reject password without lowercase letter", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "TEST@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          const message = result.error.issues[0].message;
          expect(message).toContain("minúscula");
        }
      });

      it("should reject password without number", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "Test@Test",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("número");
        }
      });

      it("should reject password without special character", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "Test1234",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "caractere especial"
          );
        }
      });

      it("should accept password with all special characters allowed", () => {
        const specialChars = ["@", "$", "!", "%", "*", "?", "&"];

        for (const char of specialChars) {
          const data = {
            name: "John Doe",
            email: "john@example.com",
            password: `Test${char}123`,
          };

          const result = registerSchema.safeParse(data);
          expect(result.success).toBe(true);
        }
      });

      it("should reject password with more than 100 characters", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
          password: "Test@123" + "a".repeat(93),
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            "Senha deve ter no máximo 100 caracteres"
          );
        }
      });
    });

    describe("missing fields", () => {
      it("should reject when name is missing", () => {
        const data = {
          email: "john@example.com",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject when email is missing", () => {
        const data = {
          name: "John Doe",
          password: "Test@123",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("should reject when password is missing", () => {
        const data = {
          name: "John Doe",
          email: "john@example.com",
        };

        const result = registerSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});
