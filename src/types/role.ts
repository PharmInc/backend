import { z } from "@hono/zod-openapi";

export const AuthRoleSchema = z
  .enum(["USER", "INSTITUTE"])
  .openapi("AuthRoleSchema");
export const UserRoleSchema = z
  .enum(["DOCTOR", "NURSE"])
  .openapi("UserRoleSchema");
