/**
 * Schemas JSON Schema para endpoints de autenticação
 */

import {
  errorSchema,
  unauthorizedSchema,
  validationErrorSchema,
} from "./common.schemas";

// POST /auth/register
export const registerSchema = {
  tags: ["Auth"],
  summary: "Register a new user",
  description: "Creates a new user account with email and password",
  body: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: {
        type: "string",
        minLength: 3,
        maxLength: 100,
        description: "User's full name",
      },
      email: {
        type: "string",
        format: "email",
        description: "Valid email address",
      },
      password: {
        type: "string",
        minLength: 8,
        description:
          "Password with at least 8 characters, including uppercase, lowercase, number and special character",
      },
    },
  },
  response: {
    201: {
      description: "User successfully registered",
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    409: {
      description: "Email already exists",
      ...errorSchema,
    },
  },
} as const;

// POST /auth/login
export const loginSchema = {
  tags: ["Auth"],
  summary: "Login with email and password",
  description: "Authenticates a user and returns access and refresh tokens",
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      description: "Successfully authenticated",
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Invalid credentials",
      ...errorSchema,
    },
  },
} as const;

// POST /auth/refresh
export const refreshTokenSchema = {
  tags: ["Auth"],
  summary: "Refresh access token",
  description:
    "Generates a new access token using a valid refresh token. Implements token rotation.",
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
      },
    },
  },
  response: {
    200: {
      description: "New tokens generated",
      type: "object",
      properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" },
      },
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Invalid or revoked token",
      ...unauthorizedSchema,
    },
  },
} as const;

// DELETE /auth/logout
export const logoutSchema = {
  tags: ["Auth"],
  summary: "Logout (revoke refresh token)",
  description:
    "Revokes the provided refresh token, preventing it from being used again",
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
      },
    },
  },
  response: {
    204: {
      description: "Token successfully revoked",
      type: "null",
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Invalid token",
      ...unauthorizedSchema,
    },
  },
} as const;
