import { FastifyInstance } from "fastify";
import { authRoutes } from "./auth.routes";
import { tasksRoutes } from "./tasks.routes";
import { healthRoutes } from "./health.routes";

export async function routes(app: FastifyInstance) {
  app.register(healthRoutes);
  app.register(authRoutes);
  app.register(tasksRoutes);
}
