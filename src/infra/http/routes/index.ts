import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { tasksRoutes } from "./tasks.routes";

export async function routes(app: FastifyInstance) {
  app.register(authRoutes);
  app.register(tasksRoutes);
}
