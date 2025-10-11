import { z } from "@hono/zod-openapi";

export const ApplicationSchema = z
  .object({
    id: z.string().openapi({
      description: "Unique identifier for the application (UUID).",
    }),
    created_at: z.date().openapi({
      description: "Timestamp when the application was created.",
    }),
    updated_at: z.date().openapi({
      description: "Timestamp when the application was last updated.",
    }),

    status: z.string().default("pending").openapi({
      description:
        "Current status of the application. Can be 'pending', 'accepted', or 'rejected'.",
    }),
    appliedDate: z.date().openapi({
      description: "Date when the user applied for the job.",
    }),
    resumeUrl: z.string().url().openapi({
      description: "URL to the applicant's resume document.",
    }),

    coverLetter: z.string().nullable().optional().openapi({
      description: "Optional cover letter submitted by the applicant.",
    }),
    experienceYears: z.number().nullable().optional().openapi({
      description: "Number of years of professional experience.",
    }),
    currentPosition: z.string().nullable().optional().openapi({
      description: "Applicant's current job title or position.",
    }),
    currentInstitute: z.string().nullable().optional().openapi({
      description: "Name of the institute where the applicant currently works.",
    }),
    additionalDetails: z.any().nullable().optional().openapi({
      description:
        "Additional details or metadata submitted along with the application in JSON format.",
    }),

    jobId: z.string().openapi({
      description: "ID of the job the user applied for.",
    }),
    userId: z.string().openapi({
      description: "ID of the user who submitted the application.",
    }),
  })
  .openapi("Application");

export const ApplicationCreateUpdateSchema = ApplicationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  status: true,
});
