import { z, createRoute } from "@hono/zod-openapi";
import { AuthSchema } from "../../types/auth.js";

export const signin = createRoute({
  method: "post",
  path: "/signin",
  tags: ["Auth"],
  description:
    "Authenticate a user with email and password. Responds with a signed JWT access token that can be used to access protected endpoints.",
  request: {
    body: {
      required: true,
      description: "User credentials required for authentication.",
      content: {
        "application/json": {
          schema: AuthSchema.omit({
            id: true,
            created_at: true,
            role: true,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "User authenticated successfully. Returns a JWT access token which should be included in the `Authorization` header as `Bearer <token>` for subsequent requests.",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string().openapi({
              description:
                "The signed JSON Web Token. Contains auth id, role, issued at time and expiration time.",
            }),
          }),
        },
      },
    },
    400: {
      description:
        "Bad request. The request body is malformed or required fields are missing.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Invalid request payload",
              description: "Details about the validation failure.",
            }),
          }),
        },
      },
    },
    403: {
      description:
        "Forbidden. The provided password does not match the stored credentials.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Invalid password",
              description: "Returned when the password is incorrect.",
            }),
          }),
        },
      },
    },
    404: {
      description: "Not Found. No auth exists with the given email address.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Auth not found",
              description:
                "Returned when no auth is found with the provided email.",
            }),
          }),
        },
      },
    },
    500: {
      description:
        "Internal server error. Authentication failed due to a misconfiguration or server issue.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "JWT secret not set",
              description:
                "Returned when the server cannot sign the token, typically due to missing environment configuration.",
            }),
          }),
        },
      },
    },
  },
});

export const signup = createRoute({
  method: "post",
  path: "/signup",
  tags: ["Auth"],
  description:
    "Register a new account by creating an auth record. Returns a JWT for immediate authentication.",
  request: {
    body: {
      required: true,
      description:
        "Credentials and role required for creating a new auth record.",
      content: {
        "application/json": {
          schema: AuthSchema.omit({
            id: true,
            created_at: true,
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Auth record created successfully. Returns a JWT.",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string().openapi({
              description: "JWT token for authentication",
            }),
          }),
        },
      },
    },
    400: {
      description:
        "Bad request. The request body is malformed or required fields are missing.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Invalid request payload",
              description: "Details about the validation failure.",
            }),
          }),
        },
      },
    },
    409: {
      description:
        "Conflict. An auth record with the provided email already exists.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Email already registered",
              description:
                "Returned when a duplicate email is used for signup.",
            }),
          }),
        },
      },
    },
    500: {
      description:
        "Internal server error. Signup failed due to a misconfiguration or server issue.",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string().openapi({
              example: "Database connection error",
              description:
                "Returned when the server cannot persist the auth record.",
            }),
          }),
        },
      },
    },
  },
});
