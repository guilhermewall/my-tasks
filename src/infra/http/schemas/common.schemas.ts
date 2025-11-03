/**
 * Schemas JSON Schema comuns usados em múltiplos endpoints
 */

export const errorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    statusCode: { type: "number" },
  },
  required: ["error", "message", "statusCode"],
} as const;

export const validationErrorSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    statusCode: { type: "number" },
    validation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          field: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  required: ["error", "message", "statusCode"],
} as const;

export const unauthorizedSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    statusCode: { type: "number" },
  },
} as const;

export const notFoundSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    statusCode: { type: "number" },
  },
} as const;

export const rateLimitSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    message: {
      type: "string",
    },
    statusCode: { type: "number" },
  },
} as const;
