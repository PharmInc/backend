import { z, createRoute } from "@hono/zod-openapi";
import {
  ApplicationCreateUpdateSchema,
  ApplicationSchema,
} from "../../../types/application.js";

export const getApplicationsByJobId = createRoute({
  method: "get",
  path: "/job/{jobId}",
  tags: ["Application"],
  description:
    "Fetch all applications submitted for a specific job. Accessible only by institute users who own the job.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      jobId: z.string().openapi({
        description:
          "Unique ID of the job whose applications are to be fetched.",
      }),
    }),
  },
  responses: {
    200: {
      description: "List of applications for the given job.",
      content: {
        "application/json": {
          schema: z.array(ApplicationSchema),
        },
      },
    },
    401: {
      description: "Unauthorized. JWT missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Only institutes can access job applications.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "Job not found or no applications exist.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "No applications found" },
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Database error" },
        },
      },
    },
  },
});

export const getApplicationsByUserId = createRoute({
  method: "get",
  path: "/user/{userId}",
  tags: ["Application"],
  description:
    "Fetch all applications submitted by a specific user. Accessible only by that user or an admin.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string().openapi({
        description: "ID of the user whose applications are to be fetched.",
      }),
    }),
  },
  responses: {
    200: {
      description: "List of applications created by the given user.",
      content: {
        "application/json": {
          schema: z.array(ApplicationSchema),
        },
      },
    },
    401: {
      description: "Unauthorized. JWT missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Cannot view another user's applications.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "No applications found for this user.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "No applications found" },
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Database error" },
        },
      },
    },
  },
});

export const getUserApplicationBYJobId = createRoute({
  method: "get",
  path: "/user/{userId}/job/{jobId}",
  tags: ["Application"],
  description:
    "Fetch a specific application submitted by a user for a given job.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      userId: z.string().openapi({
        description: "ID of the user who applied.",
      }),
      jobId: z.string().openapi({
        description: "ID of the job the user applied for.",
      }),
    }),
  },
  responses: {
    200: {
      description: "Application found for the given user and job.",
      content: {
        "application/json": {
          schema: ApplicationSchema,
        },
      },
    },
    401: {
      description: "Unauthorized. JWT missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description:
        "Forbidden. User can only view their own applications, or institutes can view applications for their own jobs.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "No application found for this user and job.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Application not found" },
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Database error" },
        },
      },
    },
  },
});

export const getApplicationById = createRoute({
  method: "get",
  path: "/{applicationId}",
  tags: ["Application"],
  description:
    "Fetch a single application by its unique ID. Accessible by the applicant or the job’s institute.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      applicationId: z.string().openapi({
        description: "Unique ID of the application.",
      }),
    }),
  },
  responses: {
    200: {
      description: "Application retrieved successfully.",
      content: {
        "application/json": {
          schema: ApplicationSchema,
        },
      },
    },
    401: {
      description: "Unauthorized. JWT missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description:
        "Forbidden. User cannot access an application that doesn’t belong to them or their job posting.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "Application not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Application not found" },
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Database error" },
        },
      },
    },
  },
});

export const createApplication = createRoute({
  method: "post",
  path: "/",
  tags: ["Application"],
  description: "Submit a new application for a job. Only authenticated users.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: ApplicationCreateUpdateSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Application created successfully.",
      content: { "application/json": { schema: ApplicationSchema } },
    },
    401: {
      description: "Unauthorized. JWT missing or invalid.",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

export const updateApplication = createRoute({
  method: "put",
  path: "/{applicationId}",
  tags: ["Application"],
  description: "Update an existing application. Only the applicant can update.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ applicationId: z.string() }),
    body: {
      content: {
        "application/json": { schema: ApplicationCreateUpdateSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Application updated successfully.",
      content: { "application/json": { schema: ApplicationSchema } },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    404: {
      description: "Application not found",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    400: {
      description: "Invalid input",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});

export const deleteApplication = createRoute({
  method: "delete",
  path: "/{applicationId}",
  tags: ["Application"],
  description: "Delete an application. Only the applicant can delete.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ applicationId: z.string() }),
  },
  responses: {
    204: {
      description: "Application deleted successfully.",
      content: {},
    },
    200: {
      description: "Application deleted successfully.",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    404: {
      description: "Application not found",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
  },
});
