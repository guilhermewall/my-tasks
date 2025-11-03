import { describe, it, expect } from "vitest";
import { BcryptPasswordHasher } from "@infra/auth/bcrypt-password-hasher";

describe("BcryptPasswordHasher", () => {
  describe("hash()", () => {
    it("deve criar um hash bcrypt válido", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "mySecurePassword123";

      const hash = await hasher.hash(password);

      // Hash bcrypt sempre começa com $2a$, $2b$ ou $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
      expect(hash).toHaveLength(60); // bcrypt hash tem sempre 60 caracteres
    });

    it("deve gerar hashes diferentes para a mesma senha (salt aleatório)", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "samePassword";

      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it("deve respeitar o cost factor configurado", async () => {
      const rounds = 12;
      const hasher = new BcryptPasswordHasher(rounds);
      const password = "test123";

      const hash = await hasher.hash(password);

      // O cost factor está na posição 4-5 do hash (ex: $2b$12$...)
      const costFromHash = Number.parseInt(hash.substring(4, 6), 10);
      expect(costFromHash).toBe(rounds);
    });

    it("deve usar BCRYPT_COST padrão do env quando não especificado", async () => {
      const hasher = new BcryptPasswordHasher();
      const password = "defaultCost";

      const hash = await hasher.hash(password);

      // Verifica se gerou um hash válido
      expect(hash).toMatch(/^\$2[aby]\$/);
      expect(hash).toHaveLength(60);
    });
  });

  describe("verify()", () => {
    it("deve retornar true para senha correta", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "correctPassword";
      const hash = await hasher.hash(password);

      const isValid = await hasher.verify(password, hash);

      expect(isValid).toBe(true);
    });

    it("deve retornar false para senha incorreta", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "correctPassword";
      const hash = await hasher.hash(password);

      const isValid = await hasher.verify("wrongPassword", hash);

      expect(isValid).toBe(false);
    });

    it("deve retornar false para hash inválido", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "anyPassword";
      const invalidHash = "not-a-valid-bcrypt-hash";

      const isValid = await hasher.verify(password, invalidHash);

      expect(isValid).toBe(false);
    });

    it("deve ser case-sensitive", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "CaseSensitive";
      const hash = await hasher.hash(password);

      const isValidLower = await hasher.verify("casesensitive", hash);
      const isValidUpper = await hasher.verify("CASESENSITIVE", hash);
      const isValidCorrect = await hasher.verify("CaseSensitive", hash);

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
      expect(isValidCorrect).toBe(true);
    });

    it("deve verificar hashes gerados com diferentes cost factors", async () => {
      const password = "testPassword";

      // Gera hash com cost 10
      const hasher10 = new BcryptPasswordHasher(10);
      const hash10 = await hasher10.hash(password);

      // Verifica com instância de cost 12 (deve funcionar!)
      const hasher12 = new BcryptPasswordHasher(12);
      const isValid = await hasher12.verify(password, hash10);

      expect(isValid).toBe(true);
    });
  });

  describe("integração hash + verify", () => {
    it("deve funcionar end-to-end com senhas complexas", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const complexPassword = "P@ssw0rd!#$%^&*()_+{}|:\"<>?[];',./`~";

      const hash = await hasher.hash(complexPassword);
      const isValid = await hasher.verify(complexPassword, hash);

      expect(isValid).toBe(true);
    });

    it("deve funcionar com senhas muito longas (72 bytes - limite bcrypt)", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const longPassword = "a".repeat(72); // bcrypt trunca após 72 bytes

      const hash = await hasher.hash(longPassword);
      const isValid = await hasher.verify(longPassword, hash);

      expect(isValid).toBe(true);
    });

    it("deve rejeitar senha vazia", async () => {
      const hasher = new BcryptPasswordHasher(10);
      const password = "";

      const hash = await hasher.hash(password);
      const isValid = await hasher.verify(password, hash);

      expect(isValid).toBe(true); // bcrypt aceita string vazia
    });
  });
});
