import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { DrizzleTaskRepository } from "@infra/db/drizzle-task-repository";
import { Task } from "@core/entities/task";
import { User } from "@core/entities/user";
import { NotFoundError } from "@core/errors/not-found-error";
import { db } from "@infra/db/connection";
import { tasks, users } from "@infra/db/schema";

describe("DrizzleTaskRepository (integration)", () => {
  let repository: DrizzleTaskRepository;
  let testUser: User;

  beforeEach(async () => {
    repository = new DrizzleTaskRepository();

    // Limpa as tabelas
    await db.delete(tasks);
    await db.delete(users);

    // Cria usuário de teste
    testUser = User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "$2b$10$testhash",
    });

    await db.insert(users).values({
      id: testUser.id,
      name: testUser.name,
      email: testUser.email.getValue(),
      passwordHash: "$2b$10$testhash",
      createdAt: testUser.createdAt,
      updatedAt: testUser.updatedAt,
    });
  });

  afterAll(async () => {
    await db.delete(tasks);
    await db.delete(users);
  });

  describe("create()", () => {
    it("deve criar uma task no banco de dados", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "Test Task",
        description: "Test description",
        priority: "high",
      });

      await repository.create(task);

      // Verifica no banco
      const [row] = await db.select().from(tasks).where(eq(tasks.id, task.id));

      expect(row).toBeDefined();
      expect(row.title).toBe("Test Task");
      expect(row.description).toBe("Test description");
      expect(row.status).toBe("pending");
      expect(row.priority).toBe("high");
    });

    it("deve criar task sem description (null)", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "Task without description",
      });

      await repository.create(task);

      const [row] = await db.select().from(tasks).where(eq(tasks.id, task.id));

      expect(row.description).toBeNull();
    });

    it("deve criar task com dueDate", async () => {
      const dueDate = new Date("2025-12-31");
      const task = Task.create({
        userId: testUser.id,
        title: "Task with due date",
        dueDate,
      });

      await repository.create(task);

      const [row] = await db.select().from(tasks).where(eq(tasks.id, task.id));

      expect(row.dueDate).toBe("2025-12-31");
    });
  });

  describe("findByIdOwned()", () => {
    it("deve encontrar task pelo ID e userId", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "Find me",
      });
      await repository.create(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(task.id);
    });

    it("deve retornar null quando task não pertence ao usuário", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "My task",
      });
      await repository.create(task);

      const otherUserId = crypto.randomUUID();
      const found = await repository.findByIdOwned(task.id, otherUserId);
      expect(found).toBeNull();
    });

    it("deve retornar null quando task não existe", async () => {
      const nonExistentId = crypto.randomUUID();
      const found = await repository.findByIdOwned(nonExistentId, testUser.id);
      expect(found).toBeNull();
    });
  });

  describe("list()", () => {
    it("deve listar tasks do usuário", async () => {
      const task1 = Task.create({ userId: testUser.id, title: "Task 1" });
      const task2 = Task.create({ userId: testUser.id, title: "Task 2" });

      await repository.create(task1);
      await repository.create(task2);

      const result = await repository.list({
        userId: testUser.id,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pageInfo.hasNextPage).toBe(false);
    });

    it("deve filtrar por status", async () => {
      const task1 = Task.create({ userId: testUser.id, title: "Pending" });
      const task2 = Task.create({ userId: testUser.id, title: "Done" });
      task2.markAsDone();

      await repository.create(task1);
      await repository.create(task2);

      const pending = await repository.list({
        userId: testUser.id,
        status: "pending",
      });

      const done = await repository.list({
        userId: testUser.id,
        status: "done",
      });

      expect(pending.data).toHaveLength(1);
      expect(pending.data[0].status).toBe("pending");
      expect(done.data).toHaveLength(1);
      expect(done.data[0].status).toBe("done");
    });

    it("deve buscar por texto (title)", async () => {
      await repository.create(
        Task.create({ userId: testUser.id, title: "Buy groceries" })
      );
      await repository.create(
        Task.create({ userId: testUser.id, title: "Buy car" })
      );
      await repository.create(
        Task.create({ userId: testUser.id, title: "Clean house" })
      );

      const result = await repository.list({
        userId: testUser.id,
        search: "buy",
      });

      expect(result.data).toHaveLength(2);
    });

    it("deve buscar por texto (description)", async () => {
      await repository.create(
        Task.create({
          userId: testUser.id,
          title: "Task 1",
          description: "Important meeting",
        })
      );
      await repository.create(
        Task.create({
          userId: testUser.id,
          title: "Task 2",
          description: "Random stuff",
        })
      );

      const result = await repository.list({
        userId: testUser.id,
        search: "meeting",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("Task 1");
    });

    it("deve respeitar limit", async () => {
      for (let i = 0; i < 25; i++) {
        await repository.create(
          Task.create({ userId: testUser.id, title: `Task ${i}` })
        );
      }

      const result = await repository.list({
        userId: testUser.id,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.pageInfo.hasNextPage).toBe(true);
      expect(result.pageInfo.nextCursor).toBeTruthy();
    });

    it("deve implementar paginação cursor-based", async () => {
      // Cria 25 tasks com delay para garantir createdAt diferente
      for (let i = 0; i < 25; i++) {
        await repository.create(
          Task.create({ userId: testUser.id, title: `Task ${i}` })
        );
      }

      // Primeira página
      const page1 = await repository.list({
        userId: testUser.id,
        limit: 10,
        order: "desc",
      });

      expect(page1.data).toHaveLength(10);
      expect(page1.pageInfo.hasNextPage).toBe(true);

      // Segunda página usando cursor
      const page2 = await repository.list({
        userId: testUser.id,
        limit: 10,
        order: "desc",
        cursor: page1.pageInfo.nextCursor!,
      });

      expect(page2.data).toHaveLength(10);
      expect(page2.pageInfo.hasNextPage).toBe(true);

      // Terceira página
      const page3 = await repository.list({
        userId: testUser.id,
        limit: 10,
        order: "desc",
        cursor: page2.pageInfo.nextCursor!,
      });

      expect(page3.data).toHaveLength(5); // Restantes
      expect(page3.pageInfo.hasNextPage).toBe(false);
      expect(page3.pageInfo.nextCursor).toBeNull();

      // Garante que não há duplicatas entre páginas
      const allIds = [
        ...page1.data.map((t) => t.id),
        ...page2.data.map((t) => t.id),
        ...page3.data.map((t) => t.id),
      ];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(25);
    });

    it("deve ordenar ascendente quando order=asc", async () => {
      const task1 = Task.create({ userId: testUser.id, title: "First" });
      await new Promise((resolve) => setTimeout(resolve, 10));

      const task2 = Task.create({ userId: testUser.id, title: "Second" });

      await repository.create(task1);
      await repository.create(task2);

      const result = await repository.list({
        userId: testUser.id,
        order: "asc",
      });

      expect(result.data[0].title).toBe("First");
      expect(result.data[1].title).toBe("Second");
    });

    it("não deve retornar tasks de outros usuários", async () => {
      const otherUser = User.create({
        name: "Other User",
        email: "other@example.com",
        passwordHash: "$2b$10$hash",
      });

      await db.insert(users).values({
        id: otherUser.id,
        name: otherUser.name,
        email: otherUser.email.getValue(),
        passwordHash: "$2b$10$hash",
        createdAt: otherUser.createdAt,
        updatedAt: otherUser.updatedAt,
      });

      await repository.create(
        Task.create({ userId: testUser.id, title: "My task" })
      );
      await repository.create(
        Task.create({ userId: otherUser.id, title: "Other task" })
      );

      const result = await repository.list({
        userId: testUser.id,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe("My task");
    });
  });

  describe("updateStatus()", () => {
    it("deve atualizar status da task", async () => {
      const task = Task.create({ userId: testUser.id, title: "To do" });
      await repository.create(task);

      const updated = await repository.updateStatus(
        task.id,
        testUser.id,
        "done"
      );

      expect(updated.status).toBe("done");

      // Verifica no banco
      const [row] = await db.select().from(tasks).where(eq(tasks.id, task.id));

      expect(row.status).toBe("done");
    });

    it("deve lançar NotFoundError quando task não pertence ao usuário", async () => {
      const task = Task.create({ userId: testUser.id, title: "My task" });
      await repository.create(task);

      const otherUserId = crypto.randomUUID();
      await expect(
        repository.updateStatus(task.id, otherUserId, "done")
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar NotFoundError quando task não existe", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        repository.updateStatus(nonExistentId, testUser.id, "done")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("update()", () => {
    it("deve atualizar título da task", async () => {
      const task = Task.create({ userId: testUser.id, title: "Old title" });
      await repository.create(task);

      task.updateTitle("New title");
      await repository.update(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found?.title).toBe("New title");
    });

    it("deve atualizar description", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "Task",
        description: "Old",
      });
      await repository.create(task);

      task.updateDescription("New description");
      await repository.update(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found?.description).toBe("New description");
    });

    it("deve atualizar priority", async () => {
      const task = Task.create({ userId: testUser.id, title: "Task" });
      await repository.create(task);

      task.updatePriority("high");
      await repository.update(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found?.priority).toBe("high");
    });

    it("deve atualizar dueDate", async () => {
      const task = Task.create({ userId: testUser.id, title: "Task" });
      await repository.create(task);

      const newDueDate = new Date("2025-12-31");
      task.updateDueDate(newDueDate);
      await repository.update(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found?.dueDate?.toISOString().split("T")[0]).toBe("2025-12-31");
    });
  });

  describe("delete()", () => {
    it("deve deletar task do banco", async () => {
      const task = Task.create({ userId: testUser.id, title: "To delete" });
      await repository.create(task);

      await repository.delete(task.id, testUser.id);

      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found).toBeNull();
    });

    it("não deve deletar task de outro usuário", async () => {
      const task = Task.create({ userId: testUser.id, title: "My task" });
      await repository.create(task);

      const otherUserId = crypto.randomUUID();
      await repository.delete(task.id, otherUserId);

      // Task ainda deve existir
      const found = await repository.findByIdOwned(task.id, testUser.id);
      expect(found).toBeDefined();
    });

    it("deve ser idempotente (não falhar se task não existe)", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        repository.delete(nonExistentId, testUser.id)
      ).resolves.not.toThrow();
    });
  });

  describe("toDomain (mapeamento)", () => {
    it("deve mapear corretamente do DB para entidade", async () => {
      const task = Task.create({
        userId: testUser.id,
        title: "Mapping test",
        description: "Test description",
        priority: "high",
        dueDate: new Date("2025-12-31"),
      });

      await repository.create(task);

      const found = await repository.findByIdOwned(task.id, testUser.id);

      expect(found).toBeInstanceOf(Task);
      expect(found?.title).toBe("Mapping test");
      expect(found?.description).toBe("Test description");
      expect(found?.priority).toBe("high");
      expect(found?.status).toBe("pending");
    });
  });
});
