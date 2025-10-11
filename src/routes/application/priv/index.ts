import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import {
  getApplicationsByJobId,
  getApplicationsByUserId,
  getApplicationById,
  getUserApplicationBYJobId,
  createApplication,
  updateApplication,
  deleteApplication,
} from "./route.js";
import { ApplicationCreateUpdateSchema } from "../../../types/application.js";

const applicationRouter = new OpenAPIHono();
const logger = getServiceLogger("Application");

// GET: Applications by Job ID (institute only)
applicationRouter.openapi(getApplicationsByJobId, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { jobId } = c.req.valid("param");

  if (!jwtPayload) return c.json({ error: "Unauthorized" }, 401);
  if (jwtPayload.role !== "institute")
    return c.json({ error: "Forbidden" }, 403);

  try {
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: { user: true, job: true },
    });

    return c.json(applications, 200);
  } catch (err) {
    logger.error(
      { err, jobId },
      "Database error while fetching applications by job"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

// GET: Applications by User ID (user or institute)
applicationRouter.openapi(getApplicationsByUserId, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { userId } = c.req.valid("param");

  if (!jwtPayload) return c.json({ error: "Unauthorized" }, 401);
  if (jwtPayload.id !== userId && jwtPayload.role !== "institute")
    return c.json({ error: "Forbidden" }, 403);

  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      include: { job: true },
    });

    return c.json(applications, 200);
  } catch (err) {
    logger.error(
      { err, userId },
      "Database error while fetching applications by user"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

// GET: Single user application by Job ID
applicationRouter.openapi(getUserApplicationBYJobId, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { userId, jobId } = c.req.valid("param");

  if (!jwtPayload) return c.json({ error: "Unauthorized" }, 401);
  if (jwtPayload.id !== userId && jwtPayload.role !== "institute")
    return c.json({ error: "Forbidden" }, 403);

  try {
    const application = await prisma.application.findFirst({
      where: { userId, jobId },
      include: { job: true, user: true },
    });

    if (!application) return c.json({ error: "Application not found" }, 404);

    return c.json(application, 200);
  } catch (err) {
    logger.error(
      { err, userId, jobId },
      "Database error while fetching user application by job"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

// GET: Application by ID
applicationRouter.openapi(getApplicationById, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  const { applicationId } = c.req.valid("param");

  if (!jwtPayload) return c.json({ error: "Unauthorized" }, 401);

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, user: true },
    });

    if (!application) return c.json({ error: "Application not found" }, 404);
    if (jwtPayload.id !== application.userId && jwtPayload.role !== "institute")
      return c.json({ error: "Forbidden" }, 403);

    return c.json(application, 200);
  } catch (err) {
    logger.error(
      { err, applicationId },
      "Database error while fetching application by ID"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

applicationRouter.openapi(createApplication, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload?.id) return c.json({ error: "Unauthorized" }, 401);

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const parseResult = ApplicationCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json({ error: "Invalid input" }, 400);
  }

  try {
    const application = await prisma.application.create({
      data: { ...parseResult.data, userId: jwtPayload.id },
      include: { user: true, job: true },
    });
    return c.json(application, 201);
  } catch (err) {
    logger.error({ err, body }, "Database error creating application");
    return c.json({ error: "Database error" }, 500);
  }
});

applicationRouter.openapi(updateApplication, async (c) => {
  const { applicationId } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");
  if (!jwtPayload?.id) return c.json({ error: "Unauthorized" }, 401);

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    return c.json({ error: "Invalid input", err }, 400);
  }

  const parseResult = ApplicationCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) return c.json({ error: "Invalid input" }, 400);

  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app) return c.json({ error: "Application not found" }, 404);
    if (jwtPayload.id !== app.userId)
      return c.json({ error: "Forbidden" }, 403);

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: parseResult.data,
      include: { user: true, job: true },
    });
    return c.json(updated, 200);
  } catch (err) {
    logger.error(
      { err, applicationId, body },
      "Database error updating application"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

applicationRouter.openapi(deleteApplication, async (c) => {
  const { applicationId } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");

  if (!jwtPayload?.id) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await prisma.application.delete({ where: { id: applicationId } });

    return c.json({ success: true }, 200);
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      return c.json({ error: "Application not found" }, 404);
    }

    return c.json({ error: "Database error" }, 500);
  }
});

export { applicationRouter as privApplicationRouter };
