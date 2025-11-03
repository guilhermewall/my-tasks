import { db } from "@/infra/db/connection";
import { users, tasks, refreshTokens } from "@/infra/db/schema";

/**
 * Limpa todas as tabelas do banco de dados
 * Usado no setup/teardown dos testes E2E
 */
export async function cleanDatabase() {
  // Ordem importante: limpar tabelas com foreign keys primeiro
  await db.delete(refreshTokens);
  await db.delete(tasks);
  await db.delete(users);
}

/**
 * Helpers para gerar dados de teste
 */
export const testHelpers = {
  /**
   * Gera um email único para testes
   */
  uniqueEmail: () =>
    `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,

  /**
   * Dados válidos para registro
   */
  validRegisterData: () => ({
    name: "Test User",
    email: testHelpers.uniqueEmail(),
    password: "Test@123456",
  }),

  /**
   * Dados válidos para login
   */
  validLoginData: (email: string) => ({
    email,
    password: "Test@123456",
  }),

  /**
   * Espera um tempo (útil para tokens expirarem)
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};
