import { z, createRoute } from "@hono/zod-openapi";
import { JobCreateUpdateSchema, JobSchema } from "../../../types/job.js";

export const createJob = createRoute({
  method: "post",
  path: "/",
  tags: ["Job"],
  description:
    "Create a new job posting. Only authenticated institutes can create jobs. The `instituteId` will be derived from the authenticated institute's JWT.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: true,
      description:
        "Job data to create. The `id`, `created_at`, and `updated_at` fields are ignored. `instituteId` is automatically set.",
      content: {
        "application/json": {
          schema: JobCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Job created successfully.",
      content: {
        "application/json": {
          schema: JobSchema,
        },
      },
    },
    400: {
      description: "Invalid input.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Invalid input" },
        },
      },
    },
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Only institutes can create jobs.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden: only institutes may create jobs" },
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

export const updateJob = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Job"],
  description:
    "Update an existing job. Only the institute that created the job can update it.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      description:
        "Job data to update. The `id`, `created_at`, and `updated_at` fields are ignored.",
      content: {
        "application/json": {
          schema: JobCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Job updated successfully.",
      content: {
        "application/json": {
          schema: JobSchema,
        },
      },
    },
    400: {
      description: "Invalid input.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Invalid input" },
        },
      },
    },
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Only the owning institute can update this job.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: {
            error: "Forbidden: cannot update another institute's job",
          },
        },
      },
    },
    404: {
      description: "Job not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Job not found" },
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

export const deleteJob = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Job"],
  description:
    "Delete a job by ID. Only the institute that created the job can delete it.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: {
      description: "Job deleted successfully. No content returned.",
    },
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Only the owning institute can delete this job.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: {
            error: "Forbidden: cannot delete another institute's job",
          },
        },
      },
    },
    404: {
      description: "Job not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Job not found" },
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
