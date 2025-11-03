import { z } from "zod";

/**
 * Schema de validação para atualização de task
 *
 * Todos os campos são opcionais para permitir atualização parcial
 */
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Título deve ter no mínimo 3 caracteres")
      .max(200, "Título deve ter no máximo 200 caracteres")
      .optional(),

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
      .optional(),

    dueDate: z
      .string()
      .refine(
        (val) => {
          // Aceita formato ISO 8601 completo ou apenas data (YYYY-MM-DD)
          const isoRegex =
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
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
      .optional()
      .nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser informado para atualização",
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Schema de resposta de atualização de task
 */
export const updateTaskResponseSchema = z.object({
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

export type UpdateTaskResponse = z.infer<typeof updateTaskResponseSchema>;
