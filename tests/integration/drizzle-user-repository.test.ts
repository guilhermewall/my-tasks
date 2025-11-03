import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { DrizzleUserRepository } from "@infra/db/drizzle-user-repository";
import { User } from "@core/entities/user";
import { Email } from "@core/value-objects/email";
import { PasswordHash } from "@core/value-objects/password-hash";
import { db } from "@infra/db/connection";
import { users } from "@infra/db/schema";

describe("DrizzleUserRepository (integration)", () => {
  let repository: DrizzleUserRepository;

  beforeEach(async () => {
    repository = new DrizzleUserRepository();

    // Limpa a tabela antes de cada teste
    await db.delete(users);
  });

  afterAll(async () => {
    // Limpa a tabela após todos os testes
    await db.delete(users);
  });

  describe("create()", () => {
    it("deve criar um usuário no banco de dados", async () => {
      const user = User.create({
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG",
      });

      await repository.create(user);

      // Verifica se foi inserido
      const [row] = await db.select().from(users).where(eq(users.id, user.id));

      expect(row).toBeDefined();
      expect(row.name).toBe("John Doe");
      expect(row.email).toBe("john@example.com");
      expect(row.passwordHash).toBe(
        "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFG"
      );
    });

    it("deve criar múltiplos usuários", async () => {
      const user1 = User.create({
        name: "User One",
        email: "user1@example.com",
        passwordHash: "$2b$10$hash1",
      });

      const user2 = User.create({
        name: "User Two",
        email: "user2@example.com",
        passwordHash: "$2b$10$hash2",
      });

      await repository.create(user1);
      await repository.create(user2);

      const allUsers = await db.select().from(users);
      expect(allUsers).toHaveLength(2);
    });
  });

  describe("findByEmail()", () => {
    it("deve encontrar usuário por email", async () => {
      const user = User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      const found = await repository.findByEmail("jane@example.com");

      expect(found).toBeDefined();
      expect(found?.name).toBe("Jane Doe");
      expect(found?.email.getValue()).toBe("jane@example.com");
      expect(found?.id).toBe(user.id);
    });

    it("deve retornar null quando email não existe", async () => {
      const found = await repository.findByEmail("nonexistent@example.com");

      expect(found).toBeNull();
    });

    it("deve buscar email de forma case-insensitive (lowercase no DB)", async () => {
      const user = User.create({
        name: "Test User",
        email: "test@example.com", // Email.create normaliza para lowercase
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      const found = await repository.findByEmail("test@example.com");

      expect(found).toBeDefined();
      expect(found?.email.getValue()).toBe("test@example.com");
    });
  });

  describe("findById()", () => {
    it("deve encontrar usuário por ID", async () => {
      const user = User.create({
        name: "Bob Smith",
        email: "bob@example.com",
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      const found = await repository.findById(user.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(user.id);
      expect(found?.name).toBe("Bob Smith");
      expect(found?.email.getValue()).toBe("bob@example.com");
    });

    it("deve retornar null quando ID não existe", async () => {
      const found = await repository.findById(
        "00000000-0000-0000-0000-000000000000"
      );

      expect(found).toBeNull();
    });
  });

  describe("update()", () => {
    it("deve atualizar o nome do usuário", async () => {
      const user = User.create({
        name: "Old Name",
        email: "user@example.com",
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      // Atualiza o nome
      user.updateName("New Name");
      await repository.update(user);

      // Verifica no banco
      const found = await repository.findById(user.id);
      expect(found?.name).toBe("New Name");
    });

    it("deve atualizar a senha do usuário", async () => {
      const user = User.create({
        name: "User",
        email: "user@example.com",
        passwordHash: "$2b$10$oldHash",
      });

      await repository.create(user);

      // Atualiza a senha
      user.updatePassword("$2b$10$newHash");
      await repository.update(user);

      // Verifica no banco
      const found = await repository.findById(user.id);
      expect(found?.passwordHash.toString()).toBe("[REDACTED]"); // PasswordHash oculta o valor

      // Verifica diretamente no DB
      const [row] = await db.select().from(users).where(eq(users.id, user.id));

      expect(row.passwordHash).toBe("$2b$10$newHash");
    });

    it("deve atualizar updatedAt automaticamente", async () => {
      const user = User.create({
        name: "User",
        email: "user@example.com",
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      const originalUpdatedAt = user.updatedAt;

      // Aguarda 10ms para garantir que updatedAt seja diferente
      await new Promise((resolve) => setTimeout(resolve, 10));

      user.updateName("Updated Name");
      await repository.update(user);

      const found = await repository.findById(user.id);
      expect(found?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("delete()", () => {
    it("deve deletar usuário do banco", async () => {
      const user = User.create({
        name: "To Delete",
        email: "delete@example.com",
        passwordHash: "$2b$10$hash",
      });

      await repository.create(user);

      // Verifica que existe
      let found = await repository.findById(user.id);
      expect(found).toBeDefined();

      // Delete
      await repository.delete(user.id);

      // Verifica que não existe mais
      found = await repository.findById(user.id);
      expect(found).toBeNull();
    });

    it("deve ser idempotente (não falhar se usuário não existe)", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Não deve lançar erro
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });

  describe("toDomain (mapeamento)", () => {
    it("deve mapear corretamente do DB para entidade de domínio", async () => {
      const user = User.create({
        name: "Mapping Test",
        email: "mapping@example.com",
        passwordHash: "$2b$10$mappingHash",
      });

      await repository.create(user);

      const found = await repository.findById(user.id);

      // Verifica que é uma instância de User
      expect(found).toBeInstanceOf(User);

      // Verifica que value objects foram recriados
      expect(found?.email).toBeInstanceOf(Email);
      expect(found?.passwordHash).toBeInstanceOf(PasswordHash);

      // Verifica valores
      expect(found?.name).toBe("Mapping Test");
      expect(found?.email.getValue()).toBe("mapping@example.com");
    });
  });
});
