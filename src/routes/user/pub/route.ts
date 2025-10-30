import { z, createRoute } from "@hono/zod-openapi";
import { UserSchema } from "../../../types/user.js";

export const searchUsers = createRoute({
  method: "get",
  path: "/search",
  tags: ["User"],
  description:
    "Search for users by name, specialty, location, or other fields. Supports pagination.",
  request: {
    query: z.object({
      q: z.string().optional().openapi({
        example: "Jane",
        description: "Search query (name, headline, about, etc.)",
      }),
      specialty: z.string().optional().openapi({
        example: "Cardiology",
        description: "Filter by specialty",
      }),
      location: z.string().optional().openapi({
        example: "New York",
        description: "Filter by location",
      }),
      role: z.string().optional().openapi({
        example: "DOCTOR",
        description: "Filter by user role",
      }),
      verified: z.string().optional().openapi({
        example: "true",
        description: "Filter by verification status (true/false)",
      }),
      gender: z.string().optional().openapi({
        example: "female",
        description: "Filter by gender",
      }),
      page: z.string().optional().openapi({
        example: "1",
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        example: "20",
        description: "Number of users per page (default: 20)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of users matching the search query.",
      content: {
        "application/json": {
          schema: z.object({
            users: z.array(UserSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const getAllUsers = createRoute({
  method: "get",
  path: "",
  tags: ["User"],
  description:
    "Get a paginated list of users. Supports filtering by specialty, location, role, verified, gender, and name.",
  request: {
    query: z.object({
      page: z.string().optional().openapi({
        description: "Page number (default: 1)",
      }),
      pageSize: z.string().optional().openapi({
        description: "Number of users per page (default: 20)",
      }),
      specialty: z.string().optional().openapi({
        description: "Filter by specialty",
      }),
      location: z.string().optional().openapi({
        description: "Filter by location",
      }),
      role: z.string().optional().openapi({
        description: "Filter by user role",
      }),
      verified: z.string().optional().openapi({
        description: "Filter by verification status (true/false)",
      }),
      gender: z.string().optional().openapi({
        description: "Filter by gender",
      }),
      name: z.string().optional().openapi({
        description: "Filter by name (partial match)",
      }),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of users.",
      content: {
        "application/json": {
          schema: z.object({
            users: z.array(UserSchema),
            page: z.number(),
            pageSize: z.number(),
            total: z.number(),
          }),
        },
      },
    },
    400: {
      description: "Invalid query parameters.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});

export const getUserById = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["User"],
  description: "Get a user by their unique ID.",
  request: {
    params: z.object({
      id: z.string().openapi({
        description: "User ID (UUID)",
      }),
    }),
  },
  responses: {
    200: {
      description: "User found.",
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
    404: {
      description: "User not found.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
    500: {
      description: "Internal server error.",
      content: {
        "application/json": {
          schema: z.object({ error: z.string() }),
        },
      },
    },
  },
});
