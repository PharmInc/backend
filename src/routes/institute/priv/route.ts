import { z, createRoute } from "@hono/zod-openapi";
import { InstituteSchema } from "../../../types/institute.js";
import { SpecialtySchema } from "../../../types/specialty.js";

export const InstituteCreateUpdateSchema = InstituteSchema.omit({
  id: true,
  created_at: true,
}).extend({
  specialties: z.array(SpecialtySchema).optional().openapi({
    description: "List of specialties associated with the institute.",
  }),
});

export const createInstitute = createRoute({
  method: "post",
  path: "/",
  tags: ["Institute"],
  description: "Create a new institute. Requires authentication.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: true,
      description:
        "Institute data to create. The id and created_at fields are ignored.",
      content: {
        "application/json": {
          schema: InstituteCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Institute created successfully.",
      content: {
        "application/json": {
          schema: InstituteSchema,
        },
      },
    },
    400: {
      description: "Invalid input or institute already exists.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Institute already exists" },
        },
      },
    },
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    409: {
      description: "Conflict. Institute already exists.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Institute already exists" },
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

export const updateInstitute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Institute"],
  description: "Update an existing institute. Requires authentication.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      description:
        "Institute data to update. The id and created_at fields are ignored.",
      content: {
        "application/json": {
          schema: InstituteCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Institute updated successfully.",
      content: {
        "application/json": {
          schema: InstituteSchema,
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
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Cannot update another institute.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "Institute not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Institute not found" },
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

export const deleteInstitute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Institute"],
  description: "Delete an institute by ID. Requires authentication.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: {
      description: "Institute deleted successfully. No content returned.",
    },
    401: {
      description: "Unauthorized. JWT is missing or invalid.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Unauthorized" },
        },
      },
    },
    403: {
      description: "Forbidden. Cannot delete this institute.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden" },
        },
      },
    },
    404: {
      description: "Institute not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Institute not found" },
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
