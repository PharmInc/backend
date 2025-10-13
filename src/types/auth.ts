import { z } from "@hono/zod-openapi";
import { AuthRoleSchema } from "./role.js";

export const AuthSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier for the auth record (UUID).",
    }),
    created_at: z.coerce.date().openapi({
      description: "Timestamp when the auth record was created (ISO 8601).",
    }),
    email: z.string().email().openapi({
      description: "Email address used for authentication.",
    }),
    password: z.string().openapi({
      description: "Hashed user password for authentication.",
    }),
    role: AuthRoleSchema.openapi({
      example: "USER",
      description: "The role assigned to the authenticated entity.",
    }).default("USER"),
  })
  .openapi("Auth");
