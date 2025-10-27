import { MiddlewareHandler } from "hono";
import { PrismaClient } from "@prisma/client";
import { subMinutes } from "date-fns";

const prisma = new PrismaClient();

export const viewTrackerMiddleware: MiddlewareHandler = async (c, next) => {
  const jobId = c.req.param("jobId");
  if (!jobId) return await next();

  const jwtPayload = c.get("jwtPayload");
  const userId = jwtPayload?.id || null; // works even if user not logged in

  try {
    // Avoid multiple logs within 10 minutes
    const recent = await prisma.jobView.findFirst({
      where: {
        jobId,
        userId,
        viewedAt: { gte: subMinutes(new Date(), 10) },
      },
    });

    if (!recent) {
      await prisma.jobView.create({
        data: { jobId, userId },
      });
    }
  } catch (err) {
    console.error("Error tracking job view:", err);
  }

  await next();
};
