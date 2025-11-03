import { describe, it, expect } from "vitest";
import {
  refreshTokenSchema,
  revokeTokenSchema,
} from "@interfaces/http/dtos/auth";

describe("Token DTOs", () => {
  describe("refreshTokenSchema validation", () => {
    it("should accept valid refresh token", () => {
      const validData = {
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      };

      const result = refreshTokenSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.refreshToken).toBe(validData.refreshToken);
      }
    });

    it("should reject empty refresh token", () => {
      const data = {
        refreshToken: "",
      };

      const result = refreshTokenSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Refresh token é obrigatório"
        );
      }
    });

    it("should reject when refresh token is missing", () => {
      const data = {};

      const result = refreshTokenSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept any non-empty string as refresh token", () => {
      const tokens = ["abc", "invalid-token", "123", "x"];

      for (const token of tokens) {
        const data = { refreshToken: token };
        const result = refreshTokenSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("revokeTokenSchema validation", () => {
    it("should accept valid refresh token for revocation", () => {
      const validData = {
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U",
      };

      const result = revokeTokenSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.refreshToken).toBe(validData.refreshToken);
      }
    });

    it("should reject empty refresh token", () => {
      const data = {
        refreshToken: "",
      };

      const result = revokeTokenSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Refresh token é obrigatório"
        );
      }
    });

    it("should reject when refresh token is missing", () => {
      const data = {};

      const result = revokeTokenSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
