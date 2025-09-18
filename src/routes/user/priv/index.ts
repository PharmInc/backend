import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";

import { createUser, updateUser, deleteUser } from "./route.js";

const userRouter = new OpenAPIHono();
const logger = getServiceLogger("User");

userRouter.openapi(createUser, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 400);
  }
  const authId = jwtPayload.id;
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ authId, err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }
  const userData = { ...body, id: authId };
  try {
    const existing = await prisma.user.findUnique({ where: { id: authId } });
    if (existing) {
      logger.warn({ authId }, "Attempt to create duplicate user");
      return c.json({ error: "User already exists" }, 409);
    }
    const user = await prisma.user.create({ data: userData });
    logger.info({ authId, user }, "User created successfully");
    return c.json(user, 201);
  } catch (err) {
    logger.error({ err, authId, body }, "Database error during user creation");
    return c.json({ error: "Database error" }, 500);
  }
});

userRouter.openapi(updateUser, async (c) => {
  const { id } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 400);
  }
  const authId = jwtPayload.id;
  if (id !== authId) {
    logger.warn({ authId, id }, "User tried to update another user's profile");
    return c.json({ error: "Forbidden: cannot update another user" }, 403);
  }
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ authId, id, err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: body,
    });
    logger.info({ authId, user }, "User updated successfully");
    return c.json(user, 200);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      logger.warn({ authId, id }, "User not found during update");
      return c.json({ error: "User not found" }, 404);
    }
    logger.error(
      { err, authId, id, body },
      "Database error during user update"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

userRouter.openapi(deleteUser, async (c) => {
  const { id } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");

  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 400);
  }

  const authId = jwtPayload.id;

  if (id !== authId) {
    logger.warn({ authId, id }, "User tried to delete another user's profile");
    return c.json({ error: "Forbidden: cannot delete another user" }, 403);
  }

  try {
    await prisma.user.delete({ where: { id } });
    logger.info({ authId, id }, "User deleted successfully");
    return c.body(null, 204);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      logger.warn({ authId, id }, "User not found during deletion");
      return c.json({ error: "User not found" }, 404);
    }
    logger.error({ err, authId, id }, "Database error during user deletion");
    return c.json({ error: "Database error" }, 500);
  }
});

export default userRouter;
