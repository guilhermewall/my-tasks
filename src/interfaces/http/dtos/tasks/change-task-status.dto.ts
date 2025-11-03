import { z } from "zod";

/**
 * Schema de validação para mudança de status de task
 */
export const changeTaskStatusSchema = z.object({
  status: z.enum(["pending", "done"], {
    message: "Status deve ser: pending ou done",
  }),
});

export type ChangeTaskStatusInput = z.infer<typeof changeTaskStatusSchema>;

/**
 * Schema de resposta de mudança de status
 */
export const changeTaskStatusResponseSchema = z.object({
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

export type ChangeTaskStatusResponse = z.infer<
  typeof changeTaskStatusResponseSchema
>;
