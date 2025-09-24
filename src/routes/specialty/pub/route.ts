import { z, createRoute } from "@hono/zod-openapi";
import { SpecialtySchema } from "../../../types/specialty.js";

export const searchSpecialties = createRoute({
  method: "get",
  path: "/search",
  tags: ["Specialty"],
  description:
    "Search for specialties by name. Returns specialties matching the query (case-insensitive).",
  request: {
    query: z.object({
      q: z.string().optional().openapi({
        description: "Search query for specialty name",
        example: "cardio",
      }),
      page: z.string().optional().openapi({
        description: "Page number (default: 1)",
        example: "1",
      }),
      pageSize: z.string().optional().openapi({
        description: "Number of specialties per page (default: 20)",
        example: "20",
      }),
    }),
  },
  responses: {
    200: {
      description: "List of specialties matching the search query.",
      content: {
        "application/json": {
          schema: z.object({
            specialties: z.array(SpecialtySchema),
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
