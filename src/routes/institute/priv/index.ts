import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";

import {
  createInstitute,
  updateInstitute,
  deleteInstitute,
  getMyInstitute,
  InstituteCreateUpdateSchema,
} from "./route.js";

const instituteRouter = new OpenAPIHono();
const logger = getServiceLogger("Institute");

instituteRouter.openapi(createInstitute, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const parseResult = InstituteCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    logger.warn({ errors: parseResult.error.errors }, "Validation failed");
    return c.json({ error: "Invalid input" }, 400);
  }

  const instituteData = parseResult.data;

  try {
    // Check if institute with same name exists
    const existing = await prisma.institute.findUnique({
      where: { name: instituteData.name },
    });
    if (existing) {
      logger.warn(
        { name: instituteData.name },
        "Attempt to create duplicate institute"
      );
      return c.json({ error: "Institute already exists" }, 409);
    }

    const institute = await prisma.institute.create({
      data: {
        ...instituteData,
        id: jwtPayload.id,
        specialties: instituteData.specialties
          ? {
              connectOrCreate: instituteData.specialties.map((s) => ({
                where: { name: s.name },
                create: { name: s.name },
              })),
            }
          : undefined,
      },
      include: { specialties: true },
    });

    logger.info({ institute }, "Institute created successfully");
    return c.json(institute, 201);
  } catch (err) {
    logger.error({ err, body }, "Database error during institute creation");
    return c.json({ error: "Database error" }, 500);
  }
});

instituteRouter.openapi(updateInstitute, async (c) => {
  const { id } = c.req.valid("param");

  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 401);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ id, err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const parseResult = InstituteCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    logger.warn({ errors: parseResult.error.errors }, "Validation failed");
    return c.json({ error: "Invalid input" }, 400);
  }

  const updateData = parseResult.data;

  try {
    const institute = await prisma.institute.update({
      where: { id },
      data: {
        ...updateData,
        specialties: updateData.specialties
          ? {
              set: [], // remove old specialties
              connectOrCreate: updateData.specialties.map((s) => ({
                where: { name: s.name },
                create: { name: s.name },
              })),
            }
          : undefined,
      },
      include: { specialties: true },
    });

    logger.info({ id, institute }, "Institute updated successfully");
    return c.json(institute, 200);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      logger.warn({ id }, "Institute not found during update");
      return c.json({ error: "Institute not found" }, 404);
    }
    logger.error({ err, id, body }, "Database error during institute update");
    return c.json({ error: "Database error" }, 500);
  }
});

// DELETE INSTITUTE
instituteRouter.openapi(deleteInstitute, async (c) => {
  const { id } = c.req.valid("param");

  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload || !jwtPayload.id) {
    logger.warn("JWT payload missing or invalid");
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await prisma.institute.delete({ where: { id } });
    logger.info({ id }, "Institute deleted successfully");
    return c.body(null, 204);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      logger.warn({ id }, "Institute not found during deletion");
      return c.json({ error: "Institute not found" }, 404);
    }
    logger.error({ err, id }, "Database error during institute deletion");
    return c.json({ error: "Database error" }, 500);
  }
});

instituteRouter.openapi(getMyInstitute, async (c) => {
  const jwtPayload = c.get("jwtPayload");

  if (!jwtPayload?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const institute = await prisma.institute.findUnique({
    where: { id: jwtPayload.id },
    include: {
      specialties: true,
    },
  });

  if (!institute) {
    return c.json({ error: "Institute not found" }, 404);
  }

  return c.json(institute, 200);
});

export { instituteRouter as privInstituteRouter };
