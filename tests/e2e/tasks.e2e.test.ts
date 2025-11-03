import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "@/infra/http/app";
import { cleanDatabase, testHelpers } from "@/shared/test-helpers";

describe("Tasks E2E Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  /**
   * Helper para registrar usuário e obter token de autenticação
   */
  async function registerAndLogin() {
    const userData = testHelpers.validRegisterData();

    await app.inject({
      method: "POST",
      url: "/auth/register",
      payload: userData,
    });

    const loginResponse = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: testHelpers.validLoginData(userData.email),
    });

    const { accessToken } = JSON.parse(loginResponse.body);
    return { accessToken, userEmail: userData.email };
  }

  /**
   * Helper para criar uma task
   */
  async function createTask(
    accessToken: string,
    taskData: {
      title: string;
      description?: string;
      priority?: "low" | "medium" | "high";
      dueDate?: string;
    }
  ) {
    const response = await app.inject({
      method: "POST",
      url: "/tasks",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: taskData,
    });

    return JSON.parse(response.body);
  }

  describe("POST /tasks", () => {
    it("should create a task successfully", async () => {
      const { accessToken } = await registerAndLogin();

      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high" as const,
        dueDate: "2025-12-31T23:59:59.000Z",
      };

      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: taskData,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: expect.any(String),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        status: "pending",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should create a task with minimal data", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Minimal Task",
        },
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: expect.any(String),
        title: "Minimal Task",
        status: "pending",
        priority: "medium", // valor padrão
      });
      expect(body.description).toBeNull();
      expect(body.dueDate).toBeNull();
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        payload: {
          title: "Test Task",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body)).toEqual({
        error: "Unauthorized",
        message: "Missing authorization header",
        statusCode: 401,
      });
    });

    it("should fail with invalid title (too short)", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "ab", // menos de 3 caracteres
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe("Bad Request");
    });

    it("should fail with invalid priority", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Test Task",
          priority: "invalid",
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe("Bad Request");
    });

    it("should fail with past due date", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Test Task",
          dueDate: "2020-01-01T00:00:00.000Z", // data passada
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe("Bad Request");
    });
  });

  describe("GET /tasks", () => {
    it("should list user tasks", async () => {
      const { accessToken } = await registerAndLogin();

      // Criar algumas tasks
      await createTask(accessToken, { title: "Task 1" });
      await createTask(accessToken, { title: "Task 2" });
      await createTask(accessToken, { title: "Task 3" });

      const response = await app.inject({
        method: "GET",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(3);
      // Por padrão, ordem DESC (mais recente primeiro)
      expect(body.data[0].title).toBe("Task 3");
      expect(body.data[2].title).toBe("Task 1");
      expect(body.pageInfo).toMatchObject({
        hasNextPage: false,
      });
    });

    it("should return empty list when no tasks exist", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "GET",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(0);
      // pageInfo pode estar vazio quando não há dados
      if (body.pageInfo) {
        expect(body.pageInfo.hasNextPage).toBeDefined();
      }
    });

    it("should filter tasks by status", async () => {
      const { accessToken } = await registerAndLogin();

      // Criar tasks
      const task1 = await createTask(accessToken, { title: "Pending Task" });
      await createTask(accessToken, { title: "Another Pending" });

      // Mudar status de uma task para done
      await app.inject({
        method: "PATCH",
        url: `/tasks/${task1.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: { status: "done" },
      });

      // Buscar apenas tasks pending
      const pendingResponse = await app.inject({
        method: "GET",
        url: "/tasks?status=pending",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const pendingBody = JSON.parse(pendingResponse.body);
      expect(pendingBody.data).toHaveLength(1);
      expect(pendingBody.data[0].title).toBe("Another Pending");

      // Buscar apenas tasks done
      const doneResponse = await app.inject({
        method: "GET",
        url: "/tasks?status=done",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const doneBody = JSON.parse(doneResponse.body);
      expect(doneBody.data).toHaveLength(1);
      expect(doneBody.data[0].title).toBe("Pending Task");
    });

    it("should search tasks by title and description", async () => {
      const { accessToken } = await registerAndLogin();

      await createTask(accessToken, {
        title: "Buy groceries",
        description: "Milk and bread",
      });
      await createTask(accessToken, {
        title: "Clean house",
        description: "Kitchen and bathroom",
      });
      await createTask(accessToken, {
        title: "Study programming",
        description: "Learn TypeScript",
      });

      // Buscar por "buy"
      const response1 = await app.inject({
        method: "GET",
        url: "/tasks?search=buy",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body1 = JSON.parse(response1.body);
      expect(body1.data).toHaveLength(1);
      expect(body1.data[0].title).toBe("Buy groceries");

      // Buscar por "kitchen" (na descrição)
      const response2 = await app.inject({
        method: "GET",
        url: "/tasks?search=kitchen",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body2 = JSON.parse(response2.body);
      expect(body2.data).toHaveLength(1);
      expect(body2.data[0].title).toBe("Clean house");
    });

    it("should paginate tasks with limit", async () => {
      const { accessToken } = await registerAndLogin();

      // Criar 5 tasks
      for (let i = 1; i <= 5; i++) {
        await createTask(accessToken, { title: `Task ${i}` });
      }

      // Buscar com limit=2
      const response = await app.inject({
        method: "GET",
        url: "/tasks?limit=2",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.data).toHaveLength(2);
      if (body.pageInfo) {
        expect(body.pageInfo.hasNextPage).toBe(true);
        expect(body.pageInfo.nextCursor).toBeDefined();
      }
    });

    it("should paginate with cursor", async () => {
      const { accessToken } = await registerAndLogin();

      // Criar 5 tasks
      for (let i = 1; i <= 5; i++) {
        await createTask(accessToken, { title: `Task ${i}` });
      }

      // Primeira página
      const response1 = await app.inject({
        method: "GET",
        url: "/tasks?limit=2",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body1 = JSON.parse(response1.body);
      const cursor = body1.pageInfo.nextCursor;

      // Segunda página
      const response2 = await app.inject({
        method: "GET",
        url: `/tasks?limit=2&cursor=${cursor}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body2 = JSON.parse(response2.body);
      expect(body2.data).toHaveLength(2);
      expect(body2.data[0].title).not.toBe(body1.data[0].title);
    });

    it("should order tasks ascending", async () => {
      const { accessToken } = await registerAndLogin();

      await createTask(accessToken, { title: "Task C" });
      await createTask(accessToken, { title: "Task A" });
      await createTask(accessToken, { title: "Task B" });

      const response = await app.inject({
        method: "GET",
        url: "/tasks?order=asc",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body = JSON.parse(response.body);
      expect(body.data[0].title).toBe("Task C");
      expect(body.data[2].title).toBe("Task B");
    });

    it("should order tasks descending", async () => {
      const { accessToken } = await registerAndLogin();

      await createTask(accessToken, { title: "Task C" });
      await createTask(accessToken, { title: "Task A" });
      await createTask(accessToken, { title: "Task B" });

      const response = await app.inject({
        method: "GET",
        url: "/tasks?order=desc",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const body = JSON.parse(response.body);
      expect(body.data[0].title).toBe("Task B");
      expect(body.data[2].title).toBe("Task C");
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/tasks",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should only return tasks from authenticated user", async () => {
      // Criar primeiro usuário e suas tasks
      const user1 = await registerAndLogin();
      await createTask(user1.accessToken, { title: "User 1 Task" });

      // Limpar e criar segundo usuário
      const user2 = await registerAndLogin();
      await createTask(user2.accessToken, { title: "User 2 Task" });

      // Verificar que cada usuário só vê suas próprias tasks
      const response1 = await app.inject({
        method: "GET",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${user1.accessToken}`,
        },
      });

      const body1 = JSON.parse(response1.body);
      expect(body1.data).toHaveLength(1);
      expect(body1.data[0].title).toBe("User 1 Task");

      const response2 = await app.inject({
        method: "GET",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${user2.accessToken}`,
        },
      });

      const body2 = JSON.parse(response2.body);
      expect(body2.data).toHaveLength(1);
      expect(body2.data[0].title).toBe("User 2 Task");
    });
  });

  describe("GET /tasks/:id", () => {
    it("should get task by id", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, {
        title: "Test Task",
        description: "Test Description",
      });

      const response = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: task.id,
        title: "Test Task",
        description: "Test Description",
      });
    });

    it("should return 400 for invalid task id format", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "GET",
        url: `/tasks/invalid-id`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).error).toBe("Bad Request");
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/tasks/some-id`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when trying to access another user's task", async () => {
      // Criar primeiro usuário e sua task
      const user1 = await registerAndLogin();
      const task = await createTask(user1.accessToken, {
        title: "User 1 Task",
      });

      // Criar segundo usuário
      const user2 = await registerAndLogin();

      // Tentar acessar task do user1 com token do user2
      const response = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${user2.accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toContain("Task not found");
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("should update task successfully", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, {
        title: "Original Title",
        description: "Original Description",
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Updated Title",
          description: "Updated Description",
          priority: "high",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        id: task.id,
        title: "Updated Title",
        description: "Updated Description",
        priority: "high",
      });
    });

    it("should update only specified fields", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, {
        title: "Original Title",
        description: "Original Description",
      });

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "New Title",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.title).toBe("New Title");
      expect(body.description).toBe("Original Description");
    });

    it("should return 400 for invalid task id format", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/invalid-id`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Updated Title",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/some-id`,
        payload: {
          title: "Updated Title",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when trying to update another user's task", async () => {
      // Criar primeiro usuário e sua task
      const user1 = await registerAndLogin();
      const task = await createTask(user1.accessToken, {
        title: "User 1 Task",
      });

      // Criar segundo usuário
      const user2 = await registerAndLogin();

      // Tentar atualizar task do user1 com token do user2
      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${user2.accessToken}`,
        },
        payload: {
          title: "Hacked Title",
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should fail with invalid data", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, { title: "Test Task" });

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "ab", // muito curto
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PATCH /tasks/:id/status", () => {
    it("should change task status to done", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, { title: "Test Task" });

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: "done",
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe("done");
    });

    it("should change task status to pending", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, { title: "Test Task" });

      // Mudar para done
      await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: { status: "done" },
      });

      // Voltar para pending
      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: { status: "pending" },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe("pending");
    });

    it("should return 400 for invalid task id format", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/invalid-id/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: { status: "done" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/some-id/status`,
        payload: { status: "done" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when trying to change status of another user's task", async () => {
      // Criar primeiro usuário e sua task
      const user1 = await registerAndLogin();
      const task = await createTask(user1.accessToken, {
        title: "User 1 Task",
      });

      // Criar segundo usuário
      const user2 = await registerAndLogin();

      // Tentar mudar status da task do user1 com token do user2
      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${user2.accessToken}`,
        },
        payload: { status: "done" },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should fail with invalid status", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, { title: "Test Task" });

      const response = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: "invalid",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete task successfully", async () => {
      const { accessToken } = await registerAndLogin();

      const task = await createTask(accessToken, { title: "Test Task" });

      const response = await app.inject({
        method: "DELETE",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");

      // Verificar que a task foi realmente deletada
      const getResponse = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it("should return 400 for invalid task id format", async () => {
      const { accessToken } = await registerAndLogin();

      const response = await app.inject({
        method: "DELETE",
        url: `/tasks/invalid-id`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should fail without authentication", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/tasks/some-id`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 when trying to delete another user's task", async () => {
      // Criar primeiro usuário e sua task
      const user1 = await registerAndLogin();
      const task = await createTask(user1.accessToken, {
        title: "User 1 Task",
      });

      // Criar segundo usuário
      const user2 = await registerAndLogin();

      // Tentar deletar task do user1 com token do user2
      const response = await app.inject({
        method: "DELETE",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${user2.accessToken}`,
        },
      });

      expect(response.statusCode).toBe(404);

      // Verificar que a task do user1 ainda existe
      const getResponse = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${user1.accessToken}`,
        },
      });

      expect(getResponse.statusCode).toBe(200);
    });
  });

  describe("Complete Task Flow", () => {
    it("should perform complete CRUD flow", async () => {
      const { accessToken } = await registerAndLogin();

      // 1. Criar task
      const createResponse = await app.inject({
        method: "POST",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Complete Flow Task",
          description: "Testing complete flow",
          priority: "medium",
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const task = JSON.parse(createResponse.body);

      // 2. Buscar task por ID
      const getResponse = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(getResponse.statusCode).toBe(200);
      expect(JSON.parse(getResponse.body).title).toBe("Complete Flow Task");

      // 3. Listar tasks
      const listResponse = await app.inject({
        method: "GET",
        url: "/tasks",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(listResponse.statusCode).toBe(200);
      expect(JSON.parse(listResponse.body).data).toHaveLength(1);

      // 4. Atualizar task
      const updateResponse = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          title: "Updated Flow Task",
          priority: "high",
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(JSON.parse(updateResponse.body).title).toBe("Updated Flow Task");

      // 5. Mudar status
      const statusResponse = await app.inject({
        method: "PATCH",
        url: `/tasks/${task.id}/status`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          status: "done",
        },
      });

      expect(statusResponse.statusCode).toBe(200);
      expect(JSON.parse(statusResponse.body).status).toBe("done");

      // 6. Deletar task
      const deleteResponse = await app.inject({
        method: "DELETE",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(deleteResponse.statusCode).toBe(204);

      // 7. Verificar que foi deletada
      const finalGetResponse = await app.inject({
        method: "GET",
        url: `/tasks/${task.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(finalGetResponse.statusCode).toBe(404);
    });
  });
});
