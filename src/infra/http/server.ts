import { buildApp } from "./app";
import { env } from "@infra/config/env";

/**
 * Inicializa e inicia o servidor HTTP
 */
async function start() {
  try {
    const app = await buildApp({
      logger: true,
    });

    // Graceful shutdown
    const closeGracefully = async (signal: string) => {
      app.log.info(`Received ${signal}, closing gracefully`);
      await app.close();
      process.exit(0);
    };

    process.on("SIGINT", () => closeGracefully("SIGINT"));
    process.on("SIGTERM", () => closeGracefully("SIGTERM"));

    // Inicia o servidor
    await app.listen({
      port: env.PORT,
      host: env.HOST || "0.0.0.0",
    });

    app.log.info(
      `Server running at http://${env.HOST || "0.0.0.0"}:${env.PORT}`
    );
    app.log.info(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

// Inicia o servidor
void start();
