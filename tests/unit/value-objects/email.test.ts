import { describe, it, expect } from "vitest";
import { Email } from "@core/value-objects/email";
import { ValidationError } from "@core/errors";

describe("Email Value Object", () => {
  describe("create", () => {
    it("should create a valid email", () => {
      const email = Email.create("test@example.com");
      expect(email.getValue()).toBe("test@example.com");
    });

    it("should normalize email to lowercase", () => {
      const email = Email.create("TEST@EXAMPLE.COM");
      expect(email.getValue()).toBe("test@example.com");
    });

    it("should trim whitespace", () => {
      const email = Email.create("  test@example.com  ");
      expect(email.getValue()).toBe("test@example.com");
    });

    it("should throw ValidationError for empty email", () => {
      expect(() => Email.create("")).toThrow(ValidationError);
      expect(() => Email.create("   ")).toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid format", () => {
      expect(() => Email.create("invalid")).toThrow(ValidationError);
      expect(() => Email.create("invalid@")).toThrow(ValidationError);
      expect(() => Email.create("@example.com")).toThrow(ValidationError);
    });

    it("should throw ValidationError for email too long", () => {
      const longEmail = "a".repeat(250) + "@example.com";
      expect(() => Email.create(longEmail)).toThrow(ValidationError);
    });
  });

  describe("equals", () => {
    it("should return true for same emails", () => {
      const email1 = Email.create("test@example.com");
      const email2 = Email.create("test@example.com");
      expect(email1.equals(email2)).toBe(true);
    });

    it("should return false for different emails", () => {
      const email1 = Email.create("test1@example.com");
      const email2 = Email.create("test2@example.com");
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return email as string", () => {
      const email = Email.create("test@example.com");
      expect(email.toString()).toBe("test@example.com");
    });
  });
});
