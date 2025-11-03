import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import {
  ValidationError,
  NotFoundError,
  AuthError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "@core/errors";

/**
 * Error Handler Global para Fastify
 *
 * Mapeia erros da camada de domínio/aplicação para respostas HTTP apropriadas
 */
export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Erros de validação do Zod
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation error",
      issues: error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    });
  }

  // Erros de validação do domínio
  if (error instanceof ValidationError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: error.message,
    });
  }

  // Email já existe (conflict)
  if (error instanceof EmailAlreadyExistsError) {
    return reply.status(409).send({
      statusCode: 409,
      error: "Conflict",
      message: error.message,
    });
  }

  // Credenciais inválidas
  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: error.message,
    });
  }

  // Token inválido/expirado
  if (error instanceof InvalidTokenError) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: error.message,
    });
  }

  // Auth error genérico
  if (error instanceof AuthError) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: error.message,
    });
  }

  // Recurso não encontrado
  if (error instanceof NotFoundError) {
    return reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: error.message,
    });
  }

  // Erros do Fastify (incluindo rate limit)
  if ("statusCode" in error) {
    return reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name,
      message: error.message,
    });
  }

  // Log do erro não tratado
  request.log.error(error);

  // Erro interno do servidor (catch-all)
  return reply.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
}
