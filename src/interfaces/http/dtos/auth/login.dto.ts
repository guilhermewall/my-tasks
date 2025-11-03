import { z } from "zod";

/**
 * Schema de validação para login de usuário
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido"),

  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema de resposta de login
 */
export const loginResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
  }),
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
