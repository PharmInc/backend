import { z } from "@hono/zod-openapi";
import { UserRoleSchema } from "./role.js";
import { SpecialtySchema } from "./specialty.js";

export const UserSchema = z
  .object({
    id: z.string().openapi({
      description:
        "Unique identifier for the user (UUID). **Note:** This is the same as the `Auth.id` (User ID = Auth ID).",
    }),
    created_at: z.coerce.date().openapi({
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
    specialties: z.array(SpecialtySchema).openapi({
      description: "List of specialties associated with the user.",
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

export const UserQuerySchema = z.object({
  page: z.string().optional().openapi({
    description: "Page number for pagination (default: 1).",
    example: "1",
  }),
  pageSize: z.string().optional().openapi({
    description: "Number of items per page (default: 10).",
    example: "10",
  }),
  specialties: z.string().optional().openapi({
    description:
      "Filter by specialty (single specialty name or ID). For multiple, pass comma-separated values like 'cardiology,neurology'.",
  }),
  location: z.string().optional().openapi({
    description: "Filter users by location.",
    example: "New Delhi",
  }),
  role: z.string().optional().openapi({
    description: "Filter users by role (DOCTOR, NURSE).",
    example: "DOCTOR",
  }),
  verified: z.string().optional().openapi({
    description: "Filter users by verification status (true/false).",
    example: "true",
  }),
  gender: z.string().optional().openapi({
    description: "Filter users by gender.",
    example: "Male",
  }),
  name: z.string().optional().openapi({
    description: "Search users by full name.",
    example: "Aditya Jyoti",
  }),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;
