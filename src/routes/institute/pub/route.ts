import { z, createRoute } from "@hono/zod-openapi";
import { InstituteSchema } from "../../../types/institute.js";

export const searchInstitutes = createRoute({
  method: "get",
  path: "/search",
  tags: ["Institute"],
  description:
    "Search for institutes by name, specialty, location, role, or other fields. Supports pagination.",
  request: {
    query: z.object({
      q: z.string().optional().openapi({
        example: "Apollo",
        description: "Search query (name, headline, about, etc.)",
      }),
      specialty: z.string().optional().openapi({
        example: "Cardiology",
        description: "Filter by specialty",
      }),
      location: z.string().optional().openapi({
        example: "New York",
        description: "Filter by location",
      }),
      role: z.string().optional().openapi({
        example: "HOSPITAL",
        description: "Filter by institute role",
      }),
      verified: z.string().optional().openapi({
        example: "true",
        description: "Filter by verification status (true/false)",
      }),
      page: z.string().optional().openapi({
        example: "1",
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        example: "20",
        description: "Number of institutes per page (default: 20)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of institutes matching the search query.",
      content: {
        "application/json": {
          schema: z.object({
            institutes: z.array(InstituteSchema),
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
export const getAllInstitutes = createRoute({
  method: "get",
  path: "",
  tags: ["Institute"],
  description:
    "Get a paginated list of institutes. Supports filtering by name, location, role, specialties, and verified status.",
  request: {
    query: z.object({
      page: z.string().optional().openapi({
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        description: "Number of institutes per page (default: 20)",
      }),
      name: z.string().optional().openapi({
        description: "Filter by institute name",
      }),
      location: z.string().optional().openapi({
        description: "Filter by location",
      }),
      role: z.string().optional().openapi({
        description: "Filter by institute role",
      }),
      verified: z.string().optional().openapi({
        description: "Filter by verification status (true/false)",
      }),
      specialty: z.string().optional().openapi({
        description: "Filter by specialty",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of institutes.",
      content: {
        "application/json": {
          schema: z.object({
            institutes: z.array(InstituteSchema),
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

export const getInstituteById = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Institute"],
  description: "Get an institute by its unique ID.",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "Institute ID (UUID)",
      }),
    }),
  },
  responses: {
    200: {
      description: "Institute found.",
      content: {
        "application/json": {
          schema: InstituteSchema,
        },
      },
    },
    404: {
      description: "Institute not found.",
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
