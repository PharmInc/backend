import { z } from "@hono/zod-openapi";

export const SpecialtySchema = z
  .object({
    id: z.string().uuid().openapi({
      description: "Unique identifier for the specialty (UUID).",
    }),
    name: z.string().openapi({
      description: "Name of the specialty.",
    }),
    users: z.array(z.string().uuid()).optional().openapi({
      description:
        "List of user IDs associated with this specialty (many-to-many).",
    }),
    institutes: z.array(z.string().uuid()).optional().openapi({
      description:
        "List of institute IDs associated with this specialty (many-to-many).",
    }),
  })
  .openapi("Specialty");
