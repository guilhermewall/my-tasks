import { z } from "zod";

/**
 * Schema de validação para deletar task
 */
export const deleteTaskSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

/**
 * Schema de resposta de deleção
 */
export const deleteTaskResponseSchema = z.object({
  message: z.string(),
});

export type DeleteTaskResponse = z.infer<typeof deleteTaskResponseSchema>;
