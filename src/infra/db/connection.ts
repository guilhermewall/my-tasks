import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env";
import * as schema from "./schema";

// Cliente de conexão com o PostgreSQL
const client = postgres(env.DATABASE_URL);

// Instância do Drizzle ORM
export const db = drizzle(client, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Função para fechar a conexão (útil para testes)
export async function closeConnection() {
  await client.end();
}
