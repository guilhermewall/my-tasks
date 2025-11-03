import { z } from "zod";

/**
 * Schema de validação para registro de usuário
 *
 * Regras:
 * - Nome: mínimo 2 caracteres, máximo 100
 * - Email: formato válido, normalizado para lowercase
 * - Senha: mínimo 8 caracteres, pelo menos uma letra maiúscula,
 *          uma minúscula, um número e um caractere especial
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),

  email: z.string().trim().toLowerCase().email("Email inválido"),

  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial (@$!%*?&)"
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema de resposta de registro
 */
export const registerResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.date(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;
