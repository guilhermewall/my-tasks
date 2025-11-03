import { describe, it, expect } from "vitest";
import { User } from "@core/entities/user";
import { ValidationError } from "@core/errors";

describe("User Entity", () => {
  const validUserData = {
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH",
  };

  describe("create", () => {
    it("should create a valid user", () => {
      const user = User.create(validUserData);

      expect(user.id).toBeDefined();
      expect(user.name).toBe("John Doe");
      expect(user.email.getValue()).toBe("john@example.com");
      expect(user.passwordHash.getValue()).toBe(validUserData.passwordHash);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should create user with custom id", () => {
      const customId = crypto.randomUUID();
      const user = User.create(validUserData, customId);

      expect(user.id).toBe(customId);
    });

    it("should trim whitespace from name", () => {
      const user = User.create({
        ...validUserData,
        name: "  John Doe  ",
      });

      expect(user.name).toBe("John Doe");
    });

    it("should throw ValidationError for empty name", () => {
      expect(() => User.create({ ...validUserData, name: "" })).toThrow(
        ValidationError
      );
      expect(() => User.create({ ...validUserData, name: "   " })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for name too long", () => {
      const longName = "a".repeat(121);
      expect(() => User.create({ ...validUserData, name: longName })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for invalid email", () => {
      expect(() => User.create({ ...validUserData, email: "invalid" })).toThrow(
        ValidationError
      );
    });

    it("should throw ValidationError for invalid password hash", () => {
      expect(() =>
        User.create({ ...validUserData, passwordHash: "invalid" })
      ).toThrow(ValidationError);
    });
  });

  describe("updateName", () => {
    it("should update name successfully", () => {
      const user = User.create(validUserData);
      const oldUpdatedAt = user.updatedAt;

      // Pequeno delay para garantir que updatedAt mude
      setTimeout(() => {
        user.updateName("Jane Doe");

        expect(user.name).toBe("Jane Doe");
        expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
          oldUpdatedAt.getTime()
        );
      }, 10);
    });

    it("should trim whitespace when updating name", () => {
      const user = User.create(validUserData);
      user.updateName("  Jane Doe  ");

      expect(user.name).toBe("Jane Doe");
    });

    it("should throw ValidationError for empty name", () => {
      const user = User.create(validUserData);
      expect(() => user.updateName("")).toThrow(ValidationError);
      expect(() => user.updateName("   ")).toThrow(ValidationError);
    });

    it("should throw ValidationError for name too long", () => {
      const user = User.create(validUserData);
      const longName = "a".repeat(121);
      expect(() => user.updateName(longName)).toThrow(ValidationError);
    });
  });

  describe("updatePassword", () => {
    it("should update password hash successfully", () => {
      const user = User.create(validUserData);
      const newHash = "$2b$10$newHashValue123456789012345678901234567890ABC";

      user.updatePassword(newHash);

      expect(user.passwordHash.getValue()).toBe(newHash);
    });

    it("should throw ValidationError for invalid hash format", () => {
      const user = User.create(validUserData);
      expect(() => user.updatePassword("invalid")).toThrow(ValidationError);
    });
  });

  describe("toPlainObject", () => {
    it("should convert user to plain object", () => {
      const user = User.create(validUserData);
      const plain = user.toPlainObject();

      expect(plain).toEqual({
        id: user.id,
        name: "John Doe",
        email: "john@example.com",
        passwordHash: validUserData.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute user from database data", () => {
      const dbData = {
        id: crypto.randomUUID(),
        name: "John Doe",
        email: "john@example.com",
        passwordHash: validUserData.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = User.reconstitute({
        ...dbData,
        email: { getValue: () => dbData.email } as any,
        passwordHash: { getValue: () => dbData.passwordHash } as any,
      });

      expect(user.id).toBe(dbData.id);
      expect(user.name).toBe(dbData.name);
    });
  });
});
