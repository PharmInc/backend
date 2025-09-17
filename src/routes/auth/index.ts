import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../lib/prisma-client.js";
import { getServiceLogger } from "../../lib/logging-client.js";

import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";

import { signin, signup } from "./route.js";
import { Prisma } from "@prisma/client";

const authRouter = new OpenAPIHono();
const logger = getServiceLogger("Auth");

authRouter.openapi(signin, async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  try {
    const auth = await prisma.auth.findUnique({
      where: { email },
    });

    if (!auth) {
      logger.warn({ email }, "Signin failed: user not found");
      return c.json({ error: "Auth not found" }, 404);
    }

    const validPassword = await bcrypt.compare(password, auth.password);
    if (!validPassword) {
      logger.warn({ email }, "Signin failed: invalid password");
      return c.json({ error: "Invalid password" }, 403);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT secret not set");
      return c.json({ error: "JWT secret not set" }, 500);
    }

    const token = await sign(
      {
        id: auth.id,
        role: auth.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
      },
      secret
    );

    logger.info({ email, userId: auth.id }, "Signin successful");
    return c.json({ token }, 200);
  } catch (err) {
    logger.error({ err }, "Signin error");
    return c.json({ error: "Internal server error" }, 500);
  }
});

authRouter.openapi(signup, async (c) => {
  const body = await c.req.json();
  const { email, password, role, ...userData } = body;

  try {
    const existing = await prisma.auth.findUnique({ where: { email } });
    if (existing) {
      logger.warn({ email }, "Signup failed: email already registered");
      return c.json({ error: "Email already registered" }, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const auth = await tx.auth.create({
        data: {
          email,
          password: hashedPassword,
          role: role || "USER",
        },
      });

      const user = await tx.user.create({
        data: {
          id: auth.id, // userId = authId
          name: userData.name,
          location: userData.location,
          specialty: userData.specialty,
          gender: userData.gender,
          role: userData.role || "DOCTOR",
          headline: userData.headline ?? null,
          about: userData.about ?? null,
        },
      });

      return user;
    });

    logger.info({ email, userId: result.id }, "Signup successful");
    return c.json(result, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error({ err }, "Prisma error during signup");
    } else {
      logger.error({ err }, "Unexpected error during signup");
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default authRouter;
