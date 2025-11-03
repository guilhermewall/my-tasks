import { z } from "zod";

/**
 * Schema de validação para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * Schema de resposta de refresh token
 */
export const refreshTokenResponseSchema = z.object({
  tokens: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
});

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
