import { z } from "zod";

/**
 * Schema de validação para revogação de token (logout)
 */
export const revokeTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
});

export type RevokeTokenInput = z.infer<typeof revokeTokenSchema>;

/**
 * Schema de resposta de revogação de token
 */
export const revokeTokenResponseSchema = z.object({
  message: z.string(),
});

export type RevokeTokenResponse = z.infer<typeof revokeTokenResponseSchema>;
