import { FastifyInstance } from "fastify";
import {
  createTaskSchema as createTaskZod,
  updateTaskSchema as updateTaskZod,
  changeTaskStatusSchema as changeTaskStatusZod,
  getTaskSchema as getTaskZod,
  listTasksSchema as listTasksZod,
  deleteTaskSchema as deleteTaskZod,
} from "@/interfaces/http/dtos/tasks";
import {
  changeTaskStatusSchema,
  createTaskSchema,
  deleteTaskSchema,
  getTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "../schemas/tasks.schemas";
import { CreateTaskUseCase } from "@/app/use-cases/tasks/create-task.use-case";
import { UpdateTaskUseCase } from "@/app/use-cases/tasks/update-task.use-case";
import { DeleteTaskUseCase } from "@/app/use-cases/tasks/delete-task.use-case";
import { ChangeTaskStatusUseCase } from "@/app/use-cases/tasks/change-task-status.use-case";
import { GetTaskByIdUseCase } from "@/app/use-cases/tasks/get-task-by-id.use-case";
import { ListUserTasksUseCase } from "@/app/use-cases/tasks/list-user-tasks.use-case";
import { DrizzleTaskRepository } from "@/infra/db/drizzle-task-repository";
import { authMiddleware } from "../middlewares/auth.middleware";

export async function tasksRoutes(app: FastifyInstance) {
  // Inicializa dependências
  const taskRepository = new DrizzleTaskRepository();

  // Use cases
  const createTask = new CreateTaskUseCase(taskRepository);
  const updateTask = new UpdateTaskUseCase(taskRepository);
  const deleteTask = new DeleteTaskUseCase(taskRepository);
  const changeTaskStatus = new ChangeTaskStatusUseCase(taskRepository);
  const getTaskById = new GetTaskByIdUseCase(taskRepository);
  const listUserTasks = new ListUserTasksUseCase(taskRepository);

  // Aplica middleware de autenticação em todas as rotas de tasks
  app.addHook("preHandler", authMiddleware);

  // POST /tasks - Criar nova task
  app.post(
    "/tasks",
    {
      schema: createTaskSchema,
    },
    async (request, reply) => {
      const body = createTaskZod.parse(request.body);
      const result = await createTask.execute({
        userId: request.userId,
        title: body.title,
        description: body.description ?? undefined,
        priority: body.priority,
        dueDate: body.dueDate ?? undefined,
      });

      return reply.status(201).send({
        id: result.task.id,
        title: result.task.title,
        description: result.task.description,
        status: result.task.status,
        priority: result.task.priority,
        dueDate: result.task.dueDate,
        userId: result.task.userId,
        createdAt: result.task.createdAt,
        updatedAt: result.task.updatedAt,
      });
    }
  );

  // GET /tasks - Listar tasks do usuário
  app.get(
    "/tasks",
    {
      schema: listTasksSchema,
    },
    async (request, reply) => {
      const query = listTasksZod.parse(request.query);
      const result = await listUserTasks.execute({
        userId: request.userId,
        ...query,
      });

      return reply.status(200).send({
        data: result.data.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          userId: task.userId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })),
        pageInfo: result.pageInfo,
      });
    }
  );

  // GET /tasks/:id - Buscar task por ID
  app.get(
    "/tasks/:id",
    {
      schema: getTaskSchema,
    },
    async (request, reply) => {
      const params = getTaskZod.parse(request.params);
      const result = await getTaskById.execute({
        taskId: params.id,
        userId: request.userId,
      });

      return reply.status(200).send({
        id: result.task.id,
        title: result.task.title,
        description: result.task.description,
        status: result.task.status,
        priority: result.task.priority,
        dueDate: result.task.dueDate,
        userId: result.task.userId,
        createdAt: result.task.createdAt,
        updatedAt: result.task.updatedAt,
      });
    }
  );

  // PATCH /tasks/:id - Atualizar task
  app.patch(
    "/tasks/:id",
    {
      schema: updateTaskSchema,
    },
    async (request, reply) => {
      const params = getTaskZod.parse(request.params);
      const body = updateTaskZod.parse(request.body);

      const result = await updateTask.execute({
        taskId: params.id,
        userId: request.userId,
        title: body.title,
        description: body.description ?? undefined,
        priority: body.priority,
        dueDate: body.dueDate ?? undefined,
      });

      return reply.status(200).send({
        id: result.task.id,
        title: result.task.title,
        description: result.task.description,
        status: result.task.status,
        priority: result.task.priority,
        dueDate: result.task.dueDate,
        userId: result.task.userId,
        createdAt: result.task.createdAt,
        updatedAt: result.task.updatedAt,
      });
    }
  );

  // PATCH /tasks/:id/status - Alterar status da task
  app.patch(
    "/tasks/:id/status",
    {
      schema: changeTaskStatusSchema,
    },
    async (request, reply) => {
      const params = getTaskZod.parse(request.params);
      const body = changeTaskStatusZod.parse(request.body);

      const result = await changeTaskStatus.execute({
        taskId: params.id,
        userId: request.userId,
        status: body.status,
      });

      return reply.status(200).send({
        id: result.task.id,
        title: result.task.title,
        description: result.task.description,
        status: result.task.status,
        priority: result.task.priority,
        dueDate: result.task.dueDate,
        userId: result.task.userId,
        createdAt: result.task.createdAt,
        updatedAt: result.task.updatedAt,
      });
    }
  );

  // DELETE /tasks/:id - Deletar task
  app.delete(
    "/tasks/:id",
    {
      schema: deleteTaskSchema,
    },
    async (request, reply) => {
      const params = deleteTaskZod.parse(request.params);

      await deleteTask.execute({
        taskId: params.id,
        userId: request.userId,
      });

      return reply.status(204).send();
    }
  );
}
