import { z, createRoute } from "@hono/zod-openapi";
import { SpecialtySchema } from "../../../types/specialty.js";

// Request body schema for creating a specialty
export const SpecialtyCreateSchema = SpecialtySchema.pick({
  name: true,
}).extend({
  name: z
    .string()
    .min(1)
    .openapi({ description: "Name of the specialty (lowercase in DB)" }),
});

// Create Specialty route
export const createSpecialty = createRoute({
  method: "post",
  path: "/",
  tags: ["Specialty"],
  security: [{ BearerAuth: [] }],
  description:
    "Create a new specialty if it doesn't already exist. The name is stored in lowercase for case-insensitive search.",
  request: {
    body: {
      required: true,
      description: "Specialty data to create. Only 'name' is required.",
      content: {
        "application/json": {
          schema: SpecialtyCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Specialty created successfully.",
      content: {
        "application/json": {
          schema: SpecialtySchema,
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
    409: {
      description: "Specialty already exists.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Specialty already exists" },
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
