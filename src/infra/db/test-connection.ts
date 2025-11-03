import { db } from "./connection";
import { users, tasks, refreshTokens } from "./schema";

console.log("🔍 Testing database connection and tables...\n");

try {
  // Testar contagem de usuários
  const userCount = await db.select().from(users);
  console.log(`✅ Users table: ${userCount.length} records`);

  // Testar contagem de tasks
  const taskCount = await db.select().from(tasks);
  console.log(`✅ Tasks table: ${taskCount.length} records`);

  // Testar contagem de refresh tokens
  const tokenCount = await db.select().from(refreshTokens);
  console.log(`✅ Refresh tokens table: ${tokenCount.length} records`);

  console.log("\n✅ All tables are accessible!");
  process.exit(0);
} catch (error) {
  console.error("❌ Database test failed:", error);
  process.exit(1);
}
