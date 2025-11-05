import { z } from "zod";

/**
 * Schema de validação para criação de task
 *
 * Regras:
 * - Title: obrigatório, mínimo 3 caracteres, máximo 200
 * - Description: opcional, máximo 1000 caracteres
 * - Priority: opcional (low, medium, high), default medium
 * - DueDate: opcional, deve ser data futura
 */
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Título deve ter no mínimo 3 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),

  description: z
    .string()
    .trim()
    .max(1000, "Descrição deve ter no máximo 1000 caracteres")
    .optional()
    .nullable(),

  priority: z
    .enum(["low", "medium", "high"], {
      message: "Prioridade deve ser: low, medium ou high",
    })
    .default("medium"),

  dueDate: z
    .string()
    .refine(
      (val) => {
        // Aceita formato ISO 8601 completo ou apenas data (YYYY-MM-DD)
        const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
        return isoRegex.test(val);
      },
      {
        message:
          "Data de vencimento deve estar no formato YYYY-MM-DD ou ISO 8601",
      }
    )
    .transform((val) => {
      // Se vier apenas a data (YYYY-MM-DD), adiciona horário
      if (val.length === 10) {
        return new Date(`${val}T00:00:00.000Z`);
      }
      return new Date(val);
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas a data
      return date >= today;
    }, {
      message: "Data de vencimento deve ser hoje ou no futuro",
    })
    .optional()
    .nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Schema de resposta de criação de task
 */
export const createTaskResponseSchema = z.object({
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

export type CreateTaskResponse = z.infer<typeof createTaskResponseSchema>;
