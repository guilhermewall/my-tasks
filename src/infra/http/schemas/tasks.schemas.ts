/**
 * Schemas JSON Schema para endpoints de tasks
 */

import {
  notFoundSchema,
  unauthorizedSchema,
  validationErrorSchema,
} from "./common.schemas";

const taskSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: ["string", "null"] },
    status: { type: "string", enum: ["pending", "done"] },
    priority: { type: "string", enum: ["low", "medium", "high"] },
    dueDate: { type: ["string", "null"], format: "date" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

// POST /tasks
export const createTaskSchema = {
  tags: ["Tasks"],
  summary: "Create a new task",
  description: "Creates a new task for the authenticated user",
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["title"],
    properties: {
      title: {
        type: "string",
        minLength: 3,
        maxLength: 200,
      },
      description: {
        type: "string",
        maxLength: 1000,
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        default: "medium",
      },
      dueDate: {
        type: "string",
        format: "date",
        description: "Due date in YYYY-MM-DD format (must be in the future)",
      },
    },
  },
  response: {
    201: {
      description: "Task created successfully",
      ...taskSchema,
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
  },
} as const;

// GET /tasks
export const listTasksSchema = {
  tags: ["Tasks"],
  summary: "List user tasks",
  description:
    "Returns a paginated list of tasks for the authenticated user with optional filters",
  security: [{ bearerAuth: [] }],
  querystring: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["pending", "done"],
        description: "Filter by task status",
      },
      search: {
        type: "string",
        description: "Search in title and description",
      },
      limit: {
        type: "number",
        minimum: 1,
        maximum: 100,
        default: 10,
        description: "Number of tasks per page",
      },
      cursor: {
        type: "string",
        description: "Cursor for pagination",
      },
      sortOrder: {
        type: "string",
        enum: ["asc", "desc"],
        default: "desc",
        description: "Sort order by creation date",
      },
    },
  },
  response: {
    200: {
      description: "List of tasks",
      type: "object",
      properties: {
        tasks: {
          type: "array",
          items: taskSchema,
        },
        pagination: {
          type: "object",
          properties: {
            nextCursor: { type: ["string", "null"] },
            hasMore: { type: "boolean" },
          },
        },
      },
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
  },
} as const;

// GET /tasks/:id
export const getTaskSchema = {
  tags: ["Tasks"],
  summary: "Get task by ID",
  description:
    "Returns a single task by its ID (only if it belongs to the user)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Task ID",
      },
    },
  },
  response: {
    200: {
      description: "Task found",
      ...taskSchema,
    },
    400: {
      description: "Invalid ID format",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
    404: {
      description: "Task not found or does not belong to user",
      ...notFoundSchema,
    },
  },
} as const;

// PATCH /tasks/:id
export const updateTaskSchema = {
  tags: ["Tasks"],
  summary: "Update task",
  description: "Updates task properties (only if it belongs to the user)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Task ID",
      },
    },
  },
  body: {
    type: "object",
    properties: {
      title: {
        type: "string",
        minLength: 3,
        maxLength: 200,
      },
      description: {
        type: ["string", "null"],
        maxLength: 1000,
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
      },
      dueDate: {
        type: ["string", "null"],
        format: "date",
      },
    },
  },
  response: {
    200: {
      description: "Task updated successfully",
      ...taskSchema,
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
    404: {
      description: "Task not found or does not belong to user",
      ...notFoundSchema,
    },
  },
} as const;

// PATCH /tasks/:id/status
export const changeTaskStatusSchema = {
  tags: ["Tasks"],
  summary: "Change task status",
  description:
    "Changes task status between pending and done (only if it belongs to the user)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Task ID",
      },
    },
  },
  body: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["pending", "done"],
      },
    },
  },
  response: {
    200: {
      description: "Status changed successfully",
      ...taskSchema,
    },
    400: {
      description: "Validation error",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
    404: {
      description: "Task not found or does not belong to user",
      ...notFoundSchema,
    },
  },
} as const;

// DELETE /tasks/:id
export const deleteTaskSchema = {
  tags: ["Tasks"],
  summary: "Delete task",
  description: "Deletes a task (only if it belongs to the user)",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Task ID",
      },
    },
  },
  response: {
    204: {
      description: "Task deleted successfully",
      type: "null",
    },
    400: {
      description: "Invalid ID format",
      ...validationErrorSchema,
    },
    401: {
      description: "Not authenticated",
      ...unauthorizedSchema,
    },
    404: {
      description: "Task not found or does not belong to user",
      ...notFoundSchema,
    },
  },
} as const;
