import "dotenv/config";

import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { type JwtVariables } from "hono/jwt";

import authRouter from "./routes/auth/index.js";

type Variables = JwtVariables;

const app = new OpenAPIHono<{ Variables: Variables }>();

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET not set");
}

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.use("*", cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "Pharminc Backend",
  },
});

app.use("/docs", swaggerUI({ url: "/openapi.json" }));

app.route("/v1/auth", authRouter);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });
