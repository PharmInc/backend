import { z } from "@hono/zod-openapi";
import { SpecialtySchema } from "./specialty.js";
import { InstituteSchema } from "./institute.js";

export const JobSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier for the job (UUID).",
    }),
    created_at: z.date().openapi({
      description: "Timestamp when the job was created.",
    }),
    updated_at: z.date().openapi({
      description: "Timestamp when the job was last updated.",
    }),
    title: z.string().openapi({
      description: "Title of the job position.",
    }),
    description: z.string().openapi({
      description: "Full description of the job.",
    }),
    jobType: z.string().openapi({
      description: "Type of the job (e.g., Full-time, Part-time, Internship).",
    }),
    workLocation: z.string().openapi({
      description: "Location where the job is based (onsite/remote/hybrid).",
    }),
    experienceLevel: z.string().openapi({
      description: "Required experience level (e.g., Entry, Mid, Senior).",
    }),
    requirements: z.string().openapi({
      description: "Job requirements in plain text.",
    }),
    salaryMin: z.number().openapi({
      description: "Minimum salary offered for the position.",
    }),
    salaryMax: z.number().openapi({
      description: "Maximum salary offered for the position.",
    }),
    status: z.string().default("active").openapi({
      description: "Current status of the job (active/closed).",
    }),

    shortDescription: z.string().nullable().optional().openapi({
      description: "Short summary of the job.",
    }),
    salaryCurrency: z.string().nullable().default("INR").openapi({
      description: "Currency for the salary range (default: INR).",
    }),
    applicationDeadline: z.date().nullable().optional().openapi({
      description: "Deadline for job applications.",
    }),
    contactEmail: z.string().email().nullable().optional().openapi({
      description: "Contact email for job inquiries.",
    }),
    contactPhone: z.string().nullable().optional().openapi({
      description: "Contact phone number for job inquiries.",
    }),
    contactPerson: z.string().nullable().optional().openapi({
      description: "Name of the contact person for this job.",
    }),
    additionalInfo: z.any().nullable().optional().openapi({
      description: "Additional job information in JSON format.",
    }),

    institute: InstituteSchema.openapi({
      description: "The institute offering this job.",
    }),
    specialties: z.array(SpecialtySchema).openapi({
      description: "Specialties relevant to this job.",
    }),
  })
  .openapi("Job");

export const JobCreateUpdateSchema = JobSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
  institute: true,
}).extend({
  specialties: z.array(SpecialtySchema).optional().openapi({
    description: "List of specialties required for the job.",
  }),
});
