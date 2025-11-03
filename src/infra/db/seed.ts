import { config } from "dotenv";
import { randomUUID } from "node:crypto";
import { db } from "@/infra/db/connection";
import { users, tasks, refreshTokens } from "@/infra/db/schema";
import { BcryptPasswordHasher } from "@/infra/auth/bcrypt-password-hasher";

// Carrega variáveis de ambiente
config();

/**
 * Script de Seed - Popula o banco com dados de demonstração
 *
 * Cria:
 * - 3 usuários demo
 * - 15+ tasks variadas (diferentes status, prioridades, datas)
 *
 * Uso: npm run seed
 */

async function cleanDatabase() {
  console.log("🧹 Limpando banco de dados...");
  await db.delete(refreshTokens);
  await db.delete(tasks);
  await db.delete(users);
  console.log("✅ Banco de dados limpo!\n");
}

async function seedUsers() {
  console.log("👥 Criando usuários...");

  const passwordHasher = new BcryptPasswordHasher();
  const hashedPassword = await passwordHasher.hash("Demo@123456");
  const now = new Date();

  // Usuário 1: João Silva (desenvolvedor)
  const joaoId = randomUUID();
  await db.insert(users).values({
    id: joaoId,
    name: "João Silva",
    email: "joao.silva@example.com",
    passwordHash: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  ✓ João Silva (joao.silva@example.com)`);

  // Usuário 2: Maria Santos (designer)
  const mariaId = randomUUID();
  await db.insert(users).values({
    id: mariaId,
    name: "Maria Santos",
    email: "maria.santos@example.com",
    passwordHash: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  ✓ Maria Santos (maria.santos@example.com)`);

  // Usuário 3: Pedro Costa (gerente)
  const pedroId = randomUUID();
  await db.insert(users).values({
    id: pedroId,
    name: "Pedro Costa",
    email: "pedro.costa@example.com",
    passwordHash: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`  ✓ Pedro Costa (pedro.costa@example.com)`);

  console.log("✅ 3 usuários criados!\n");

  return { joaoId, mariaId, pedroId };
}

async function seedTasks(userIds: {
  joaoId: string;
  mariaId: string;
  pedroId: string;
}) {
  console.log("📝 Criando tasks...");

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Helper para converter Date para string "YYYY-MM-DD"
  const toDateString = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Tasks do João (desenvolvedor) - 7 tasks
  const joaoTasks = [
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Implementar autenticação JWT",
      description:
        "Criar sistema de autenticação com tokens JWT, incluindo refresh tokens e revogação.",
      status: "done" as const,
      priority: "high" as const,
      dueDate: "2025-11-01",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Configurar CI/CD no GitHub Actions",
      description:
        "Setup de pipeline automatizado para testes e deploy em produção.",
      status: "pending" as const,
      priority: "high" as const,
      dueDate: toDateString(tomorrow),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Adicionar testes E2E",
      description:
        "Implementar testes de integração end-to-end para fluxos críticos.",
      status: "done" as const,
      priority: "medium" as const,
      dueDate: "2025-11-02",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Otimizar queries do banco de dados",
      description:
        "Analisar e otimizar queries lentas, adicionar índices necessários.",
      status: "pending" as const,
      priority: "medium" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Documentar API com Swagger",
      description: "Adicionar documentação OpenAPI para todos os endpoints.",
      status: "pending" as const,
      priority: "low" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Refatorar código legado",
      description:
        "Melhorar estrutura e remover código duplicado do módulo de pagamentos.",
      status: "pending" as const,
      priority: "low" as const,
      dueDate: toDateString(nextMonth),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.joaoId,
      title: "Estudar arquitetura hexagonal",
      description: "Ler livro e aplicar conceitos no projeto atual.",
      status: "pending" as const,
      priority: "low" as const,
      dueDate: null,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const task of joaoTasks) {
    await db.insert(tasks).values(task);
  }

  console.log(`  ✓ ${joaoTasks.length} tasks do João`);

  // Tasks da Maria (designer) - 5 tasks
  const mariaTasks = [
    {
      id: randomUUID(),
      userId: userIds.mariaId,
      title: "Criar protótipo da nova landing page",
      description:
        "Desenvolver protótipo interativo no Figma com todas as seções.",
      status: "done" as const,
      priority: "high" as const,
      dueDate: "2025-11-01",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.mariaId,
      title: "Revisar design system",
      description:
        "Atualizar componentes e tokens de design para nova identidade visual.",
      status: "pending" as const,
      priority: "high" as const,
      dueDate: toDateString(tomorrow),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.mariaId,
      title: "Design de telas mobile",
      description: "Criar versões responsivas para dispositivos móveis.",
      status: "pending" as const,
      priority: "medium" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.mariaId,
      title: "Pesquisa de usabilidade",
      description: "Conduzir testes de usabilidade com 10 usuários.",
      status: "pending" as const,
      priority: "medium" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.mariaId,
      title: "Atualizar guia de estilo",
      description:
        "Documentar padrões de cores, tipografia e componentes.",
      status: "pending" as const,
      priority: "low" as const,
      dueDate: toDateString(nextMonth),
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const task of mariaTasks) {
    await db.insert(tasks).values(task);
  }

  console.log(`  ✓ ${mariaTasks.length} tasks da Maria`);

  // Tasks do Pedro (gerente) - 5 tasks
  const pedroTasks = [
    {
      id: randomUUID(),
      userId: userIds.pedroId,
      title: "Reunião de planejamento sprint",
      description: "Definir escopo e prioridades da próxima sprint.",
      status: "done" as const,
      priority: "high" as const,
      dueDate: "2025-11-01",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.pedroId,
      title: "Review de performance do time",
      description: "Avaliar métricas e definir plano de desenvolvimento.",
      status: "pending" as const,
      priority: "high" as const,
      dueDate: toDateString(tomorrow),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.pedroId,
      title: "Apresentação para stakeholders",
      description: "Preparar apresentação dos resultados do trimestre.",
      status: "pending" as const,
      priority: "high" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.pedroId,
      title: "Contratar novo desenvolvedor",
      description: "Conduzir entrevistas e finalizar processo seletivo.",
      status: "pending" as const,
      priority: "medium" as const,
      dueDate: toDateString(nextWeek),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: randomUUID(),
      userId: userIds.pedroId,
      title: "Planejar OKRs do próximo trimestre",
      description: "Definir objetivos e resultados-chave com a equipe.",
      status: "pending" as const,
      priority: "medium" as const,
      dueDate: toDateString(nextMonth),
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const task of pedroTasks) {
    await db.insert(tasks).values(task);
  }

  console.log(`  ✓ ${pedroTasks.length} tasks do Pedro`);

  const totalTasks = joaoTasks.length + mariaTasks.length + pedroTasks.length;
  console.log(`✅ ${totalTasks} tasks criadas!\n`);
}

(async function main() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    // 1. Limpar banco
    await cleanDatabase();

    // 2. Criar usuários
    const userIds = await seedUsers();

    // 3. Criar tasks
    await seedTasks(userIds);

    console.log("🎉 Seed concluído com sucesso!");
    console.log("\n📋 Resumo:");
    console.log("  • 3 usuários criados");
    console.log("  • 17 tasks criadas");
    console.log("\n🔑 Credenciais de acesso:");
    console.log("  Email: joao.silva@example.com");
    console.log("  Email: maria.santos@example.com");
    console.log("  Email: pedro.costa@example.com");
    console.log("  Senha: Demo@123456\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
})();
