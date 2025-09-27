import { z, createRoute } from "@hono/zod-openapi";
import { JobSchema } from "../../../types/job.js";

export const getAllJobs = createRoute({
  method: "get",
  path: "",
  tags: ["Job"],
  description:
    "Get a paginated list of jobs. Supports filtering by job type, location, experience level, and status.",
  request: {
    query: z.object({
      page: z.string().optional().openapi({
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        description: "Number of jobs per page (default: 20)",
      }),
      jobType: z.string().optional().openapi({
        description: "Filter by job type (e.g., FULL_TIME, PART_TIME)",
      }),
      location: z.string().optional().openapi({
        description: "Filter by job location",
      }),
      experienceLevel: z.string().optional().openapi({
        description: "Filter by experience level",
      }),
      status: z.string().optional().openapi({
        description: "Filter by job status (e.g., OPEN, CLOSED)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of jobs.",
      content: {
        "application/json": {
          schema: z.object({
            jobs: z.array(JobSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const getJobById = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Job"],
  description: "Get a job by its unique ID.",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "Job ID (UUID)",
      }),
    }),
  },
  responses: {
    200: {
      description: "Job found.",
      content: {
        "application/json": {
          schema: JobSchema,
        },
      },
    },
    404: {
      description: "Job not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const getJobsByInstitution = createRoute({
  method: "get",
  path: "/institution/{instituteId}",
  tags: ["Job"],
  description: "Get a paginated list of jobs for a given institution.",
  request: {
    params: z.object({
      instituteId: z.string().openapi({
        description: "Institution ID (UUID)",
      }),
    }),
    query: z.object({
      page: z.string().optional().openapi({
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        description: "Number of jobs per page (default: 20)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of jobs for the institution.",
      content: {
        "application/json": {
          schema: z.object({
            jobs: z.array(JobSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
          }),
        },
      },
    },
    404: {
      description: "Institution not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    400: {
      description: "Invalid parameters",
      content: {
        "application/json": { schema: z.object({ error: z.string() }) },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const searchJobs = createRoute({
  method: "get",
  path: "/search",
  tags: ["Job"],
  description:
    "Search for jobs by title, location, job type, experience level, or specialty.",
  request: {
    query: z.object({
      q: z.string().optional().openapi({
        example: "Surgeon",
        description:
          "Search query (job title, description, requirements, etc.)",
      }),
      location: z.string().optional().openapi({
        example: "Delhi",
        description: "Filter by job location",
      }),
      jobType: z.string().optional().openapi({
        example: "FULL_TIME",
        description: "Filter by job type",
      }),
      experienceLevel: z.string().optional().openapi({
        example: "SENIOR",
        description: "Filter by experience level",
      }),
      specialtyId: z.string().uuid().optional().openapi({
        example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        description: "Filter by specialty ID",
      }),
      page: z.string().optional().openapi({
        example: "1",
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        example: "20",
        description: "Number of jobs per page (default: 20)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of jobs matching the search query.",
      content: {
        "application/json": {
          schema: z.object({
            jobs: z.array(JobSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});
