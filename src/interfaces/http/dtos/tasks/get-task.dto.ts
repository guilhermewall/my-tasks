import { z } from "zod";

/**
 * Schema de validação para buscar task por ID
 */
export const getTaskSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export type GetTaskInput = z.infer<typeof getTaskSchema>;

/**
 * Schema de resposta de busca de task
 */
export const getTaskResponseSchema = z.object({
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

export type GetTaskResponse = z.infer<typeof getTaskResponseSchema>;
