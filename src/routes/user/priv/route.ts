import { z, createRoute } from "@hono/zod-openapi";
import { UserSchema } from "../../../types/user.js";
import { SpecialtySchema } from "../../../types/specialty.js";

export const UserCreateUpdateSchema = UserSchema.omit({
  id: true,
  created_at: true,
  verified: true,
  headline: true,
  about: true,
}).extend({
  specialties: z.array(SpecialtySchema).optional().openapi({
    description: "List of specialties associated with the user.",
  }),
});

export const createUser = createRoute({
  method: "post",
  path: "/",
  tags: ["User"],
  description:
    "Create a new user. Requires authentication. The user id will be set to the authenticated user's id (from JWT).",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      required: true,
      description:
        "User data to create. The id and created_at fields are ignored.",
      content: {
        "application/json": {
          schema: UserCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully.",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    400: {
      description: "Invalid input or user already exists.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "User already exists" },
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
      description: "Conflict. User already exists.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "User already exists" },
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

export const updateUser = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["User"],
  description:
    "Update an existing user. Only the authenticated user can update their own record.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      description:
        "User data to update. The id and created_at fields are ignored.",
      content: {
        "application/json": {
          schema: UserCreateUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully.",
      content: {
        "application/json": {
          schema: UserSchema,
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
      description: "Forbidden. Cannot update another user's record.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden: cannot update another user" },
        },
      },
    },
    404: {
      description: "User not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "User not found" },
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

export const deleteUser = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["User"],
  description:
    "Delete a user by ID. Only the authenticated user can delete their own record.",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: {
      description: "User deleted successfully. No content returned.",
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
      description: "Forbidden. Cannot delete another user's record.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "Forbidden: cannot delete another user" },
        },
      },
    },
    404: {
      description: "User not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
          example: { error: "User not found" },
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
