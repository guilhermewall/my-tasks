/**
 * Schemas JSON Schema para endpoints de health check
 */

// GET /health
export const healthSchema = {
  tags: ["Health"],
  summary: "Health check",
  description: "Returns the current health status of the API",
  response: {
    200: {
      description: "API is healthy",
      type: "object",
      properties: {
        status: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
        uptime: { type: "number" },
        version: { type: "string" },
      },
    },
  },
} as const;

// GET /health/ready
export const healthReadySchema = {
  tags: ["Health"],
  summary: "Readiness check",
  description:
    "Checks if the API is ready to accept requests (including database connection)",
  response: {
    200: {
      description: "API is ready",
      type: "object",
      properties: {
        status: { type: "string" },
        database: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
    503: {
      description: "API is not ready",
      type: "object",
      properties: {
        status: { type: "string" },
        database: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  },
} as const;

// GET /health/live
export const healthLiveSchema = {
  tags: ["Health"],
  summary: "Liveness check",
  description: "Checks if the API process is alive",
  response: {
    200: {
      description: "API is alive",
      type: "object",
      properties: {
        status: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  },
} as const;
