import { z } from "zod";

/**
 * Schema de validação para listagem de tasks
 *
 * Suporta filtros e paginação cursor-based
 */
export const listTasksSchema = z.object({
  status: z
    .enum(["pending", "done"], {
      message: "Status deve ser: pending ou done",
    })
    .optional(),

  search: z
    .string()
    .trim()
    .min(1, "Busca deve ter no mínimo 1 caractere")
    .optional(),

  limit: z
    .number()
    .int("Limit deve ser um número inteiro")
    .min(1, "Limit deve ser no mínimo 1")
    .max(100, "Limit deve ser no máximo 100")
    .default(20),

  cursor: z.string().min(1, "Cursor inválido").optional(),

  order: z
    .enum(["asc", "desc"], {
      message: "Order deve ser: asc ou desc",
    })
    .default("desc"),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

/**
 * Schema de item de task na lista
 */
export const taskItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.enum(["pending", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TaskItem = z.infer<typeof taskItemSchema>;

/**
 * Schema de resposta de listagem com paginação
 */
export const listTasksResponseSchema = z.object({
  items: z.array(taskItemSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    nextCursor: z.string().nullable(),
  }),
});

export type ListTasksResponse = z.infer<typeof listTasksResponseSchema>;
