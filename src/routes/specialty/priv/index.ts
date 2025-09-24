import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import { createSpecialty } from "./route.js";

const specialtyRouter = new OpenAPIHono();
const logger = getServiceLogger("Specialty");

specialtyRouter.openapi(createSpecialty, async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ err }, "Failed to parse JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const name = body.name.toLowerCase();

  try {
    // Check if specialty already exists
    let specialty = await prisma.specialty.findUnique({ where: { name } });
    if (specialty) {
      return c.json({ error: "Specialty already exists" }, 409);
    }

    specialty = await prisma.specialty.create({ data: { name } });
    logger.info({ specialty }, "Specialty created successfully");
    return c.json(specialty, 201);
  } catch (err) {
    logger.error({ err, body }, "Database error during specialty creation");
    return c.json({ error: "Database error" }, 500);
  }
});

export { specialtyRouter as privSpecialtyRouter };
