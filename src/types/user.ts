import { z } from "@hono/zod-openapi";
import { UserRoleSchema } from "./role.js";

export const UserSchema = z
  .object({
    id: z.string().openapi({
      description:
        "Unique identifier for the user (UUID). **Note:** This is the same as the `Auth.id` (User ID = Auth ID).",
    }),
    created_at: z.date().openapi({
      description: "Timestamp when the user record was created (ISO 8601).",
    }),
    name: z.string().openapi({
      description: "Full name of the user.",
    }),
    location: z.string().openapi({
      description: "Geographical location of the user.",
    }),
    verified: z.boolean().openapi({
      example: true,
      description:
        "Indicates whether the user has been verified (e.g., by institution or admin). Defaults to `false`.",
    }),
    specialty: z.string().openapi({
      description:
        "The primary area of expertise or medical specialty of the user.",
    }),
    gender: z.string().openapi({
      example: "Male",
      description: "Gender of the user.",
    }),
    role: UserRoleSchema.openapi({
      example: "DOCTOR",
      description:
        "Role assigned to the user. Typically corresponds to professional type. Defaults to `DOCTOR`.",
    }).default("DOCTOR"),
    headline: z
      .string()
      .openapi({
        description: "Short professional headline displayed on the profile.",
      })
      .nullable(),
    about: z
      .string()
      .openapi({
        description:
          "Detailed biography or about section for the user's profile.",
      })
      .nullable(),
  })
  .openapi("User");
