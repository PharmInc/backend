import { z } from "@hono/zod-openapi";
import { SpecialtySchema } from "./specialty.js";
import { InstituteRolesSchema } from "./role.js";

export const InstituteSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier for the institute (UUID).",
    }),
    created_at: z.date().openapi({
      description:
        "Timestamp when the institute record was created (ISO 8601).",
    }),
    name: z.string().openapi({
      description: "Name of the institute.",
    }),
    location: z.string().openapi({
      description: "Geographical location of the institute.",
    }),
    verified: z.boolean().openapi({
      example: true,
      description:
        "Indicates if the institute is verified by admin. Defaults to false.",
    }),
    contactEmail: z.string().email().openapi({
      description: "Contact email of the institute.",
    }),
    contactNumber: z.string().openapi({
      description: "Contact phone number of the institute.",
    }),
    role: InstituteRolesSchema.openapi({
      description:
        "Role/type of the institute (HOSPITAL, CLINIC, LAB, PHARMACY).",
    }).default("HOSPITAL"),
    specialties: z.array(SpecialtySchema).openapi({
      description: "List of specialties associated with the institute.",
    }),
    affiliatedUniversity: z.string().nullable().optional().openapi({
      description: "Affiliated university if applicable.",
    }),
    yearEstablished: z.number().nullable().optional().openapi({
      description: "Year the institute was established.",
    }),
    ownership: z.string().nullable().optional().openapi({
      description:
        "Ownership type of the institute (private, government, etc.).",
    }),
    headline: z.string().nullable().optional().openapi({
      description: "Short headline describing the institute.",
    }),
    about: z.string().nullable().optional().openapi({
      description: "Detailed description of the institute.",
    }),
  })
  .openapi("Institute");

export const InstituteQuerySchema = z.object({
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
      "Filter by specialty (name or ID). For multiple, pass comma-separated values like 'cardiology,neurology'.",
  }),
  location: z.string().optional().openapi({
    description: "Filter institutes by location.",
  }),
  role: z.string().optional().openapi({
    description: "Filter by institute type/role (HOSPITAL, CLINIC, etc.)",
  }),
  verified: z.string().optional().openapi({
    description: "Filter by verification status (true/false).",
  }),
  name: z.string().optional().openapi({
    description: "Search institutes by name.",
  }),
});

export type InstituteQuery = z.infer<typeof InstituteQuerySchema>;
