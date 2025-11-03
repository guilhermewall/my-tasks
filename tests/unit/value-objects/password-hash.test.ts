import { describe, it, expect } from "vitest";
import { PasswordHash } from "@core/value-objects/password-hash";
import { ValidationError } from "@core/errors";

describe("PasswordHash Value Object", () => {
  const validBcryptHash = "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH";

  describe("create", () => {
    it("should create a valid password hash", () => {
      const hash = PasswordHash.create(validBcryptHash);
      expect(hash.getValue()).toBe(validBcryptHash);
    });

    it("should throw ValidationError for empty hash", () => {
      expect(() => PasswordHash.create("")).toThrow(ValidationError);
      expect(() => PasswordHash.create("   ")).toThrow(ValidationError);
    });

    it("should throw ValidationError for invalid hash format", () => {
      expect(() => PasswordHash.create("invalid-hash")).toThrow(
        ValidationError
      );
      expect(() => PasswordHash.create("password123")).toThrow(ValidationError);
    });

    it("should accept different bcrypt formats", () => {
      expect(() => PasswordHash.create("$2a$10$abcd...")).not.toThrow();
      expect(() => PasswordHash.create("$2b$10$abcd...")).not.toThrow();
      expect(() => PasswordHash.create("$2y$10$abcd...")).not.toThrow();
    });
  });

  describe("equals", () => {
    it("should return true for same hashes", () => {
      const hash1 = PasswordHash.create(validBcryptHash);
      const hash2 = PasswordHash.create(validBcryptHash);
      expect(hash1.equals(hash2)).toBe(true);
    });

    it("should return false for different hashes", () => {
      const hash1 = PasswordHash.create("$2b$10$hash1");
      const hash2 = PasswordHash.create("$2b$10$hash2");
      expect(hash1.equals(hash2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return [REDACTED] for security", () => {
      const hash = PasswordHash.create(validBcryptHash);
      expect(hash.toString()).toBe("[REDACTED]");
    });
  });
});
