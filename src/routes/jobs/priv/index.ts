import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";

import { createJob, updateJob, deleteJob, getJobStats } from "./route.js";
import { JobCreateUpdateSchema } from "../../../types/job.js";

const jobRouter = new OpenAPIHono();
const logger = getServiceLogger("Job");

jobRouter.openapi(createJob, async (c) => {
  const jwtPayload = c.get("jwtPayload");
  console.log(jwtPayload);
  if (!jwtPayload || !jwtPayload.id || jwtPayload.role !== "INSTITUTE") {
    logger.warn("Unauthorized job creation attempt");
    return c.json({ error: "Forbidden: only institutes may create jobs" }, 403);
  }

  const instituteId = jwtPayload.id;

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ instituteId, err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const parseResult = JobCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    logger.warn(
      { instituteId, errors: parseResult.error.errors },
      "Validation failed"
    );
    return c.json({ error: "Invalid input" }, 400);
  }

  const jobData = parseResult.data;

  try {
    const job = await prisma.job.create({
      data: {
        institute: {
          connect: { id: instituteId },
        },

        title: jobData.title,
        description: jobData.description,
        jobType: jobData.jobType,
        workLocation: jobData.workLocation,
        experienceLevel: jobData.experienceLevel,
        requirements: jobData.requirements,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        shortDescription: jobData.shortDescription,
        salaryCurrency: jobData.salaryCurrency,
        applicationDeadline: jobData.applicationDeadline,
        contactEmail: jobData.contactEmail,
        contactPhone: jobData.contactPhone,
        contactPerson: jobData.contactPerson,
        additionalInfo: jobData.additionalInfo,

        specialties: jobData.specialties
          ? {
              connectOrCreate: jobData.specialties.map((s) => ({
                where: { id: s.id },
                create: { name: s.name },
              })),
            }
          : undefined,
      },

      include: {
        specialties: true,
        institute: {
          include: {
            specialties: true,
          },
        },
      },
    });

    logger.info({ instituteId, jobId: job.id }, "Job created successfully");
    return c.json(job, 201);
  } catch (err) {
    logger.error(
      { err, instituteId, body },
      "Database error during job creation"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(updateJob, async (c) => {
  const { id } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");

  if (!jwtPayload || !jwtPayload.id || jwtPayload.role !== "INSTITUTE") {
    logger.warn("Unauthorized job update attempt");
    return c.json({ error: "Forbidden: only institutes may update jobs" }, 403);
  }

  const instituteId = jwtPayload.id;

  let body;
  try {
    body = await c.req.json();
  } catch (err) {
    logger.warn({ instituteId, jobId: id, err }, "Malformed JSON body");
    return c.json({ error: "Invalid input" }, 400);
  }

  const parseResult = JobCreateUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    logger.warn(
      { instituteId, jobId: id, errors: parseResult.error.errors },
      "Validation failed"
    );
    return c.json({ error: "Invalid input" }, 400);
  }

  const updateData = parseResult.data;

  try {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      logger.warn({ instituteId, jobId: id }, "Job not found for update");
      return c.json({ error: "Job not found" }, 404);
    }
    if (existingJob.instituteId !== instituteId) {
      logger.warn(
        { instituteId, jobId: id },
        "Institute tried to update another institute's job"
      );
      return c.json(
        { error: "Forbidden: cannot update another institute's job" },
        403
      );
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...updateData,
        specialties: updateData.specialties
          ? {
              set: [],
              connectOrCreate: updateData.specialties.map((s) => ({
                where: { id: s.id },
                create: { name: s.name },
              })),
            }
          : undefined,
      },
      include: {
        specialties: true,
        institute: {
          include: {
            specialties: true,
          },
        },
      },
    });

    logger.info({ instituteId, jobId: job.id }, "Job updated successfully");
    return c.json(job, 200);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2025"
    ) {
      logger.warn({ instituteId, jobId: id }, "Job not found during update");
      return c.json({ error: "Job not found" }, 404);
    }
    logger.error(
      { err, instituteId, jobId: id },
      "Database error during job update"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(deleteJob, async (c) => {
  const { id } = c.req.valid("param");
  const jwtPayload = c.get("jwtPayload");

  if (!jwtPayload || !jwtPayload.id || jwtPayload.role !== "INSTITUTE") {
    logger.warn("Unauthorized job delete attempt");
    return c.json({ error: "Forbidden: only institutes may delete jobs" }, 403);
  }

  const instituteId = jwtPayload.id;

  try {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      logger.warn({ instituteId, jobId: id }, "Job not found for deletion");
      return c.json({ error: "Job not found" }, 404);
    }
    if (existingJob.instituteId !== instituteId) {
      logger.warn(
        { instituteId, jobId: id },
        "Institute tried to delete another institute's job"
      );
      return c.json(
        { error: "Forbidden: cannot delete another institute's job" },
        403
      );
    }

    await prisma.job.delete({ where: { id } });
    logger.info({ instituteId, jobId: id }, "Job deleted successfully");
    return c.body(null, 204);
  } catch (err) {
    logger.error(
      { err, instituteId, jobId: id },
      "Database error during job deletion"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(getJobStats, async (c) => {
  const { jobId } = c.req.valid("param") as {
    jobId: string;
    instituteId: string;
  };
  const jwtPayload = c.get("jwtPayload") as
    | { id: string; role: string }
    | undefined;

  if (!jwtPayload || !jwtPayload.id || jwtPayload.role !== "INSTITUTE") {
    logger.warn("Unauthorized job stats access attempt");
    return c.json(
      { error: "Forbidden: only institutes may view job stats" },
      403
    );
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { instituteId: true },
    });

    if (!job || job.instituteId !== jwtPayload.id) {
      logger.warn(
        { instituteId: jwtPayload.id, jobId },
        "Job not found or access denied"
      );
      return c.json({ error: "Job not found or access denied" }, 404);
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const views = await prisma.jobView.groupBy({
      by: ["viewedAt"],
      where: {
        jobId,
        viewedAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    const applications = await prisma.application.findMany({
      where: {
        jobId,
        created_at: { gte: thirtyDaysAgo },
      },
      select: {
        created_at: true,
        status: true,
        updated_at: true,
      },
    });

    const totalViews = views.reduce((a, v) => a + v._count, 0);
    const totalResponses = applications.filter(
      (a) => a.status !== "pending"
    ).length;
    const totalConversions = applications.filter(
      (a) => a.status === "accepted"
    ).length;

    const avgResponseTime =
      applications.length > 0
        ? applications.reduce((acc, a) => {
            const diff = a.updated_at.getTime() - a.created_at.getTime();
            return acc + diff;
          }, 0) /
          applications.length /
          3600000
        : 0;

    const responseRate =
      totalViews > 0 ? (totalResponses / totalViews) * 100 : 0;
    const conversionRate =
      totalResponses > 0 ? (totalConversions / totalResponses) * 100 : 0;

    const trends = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(now.getDate() - (6 - i));
      const day = date.toISOString().split("T")[0];
      const viewCount =
        views.filter((v) => v.viewedAt.toISOString().split("T")[0] === day)
          .length || 0;
      const responseCount =
        applications.filter(
          (a) => a.created_at.toISOString().split("T")[0] === day
        ).length || 0;
      return { date: day, views: viewCount, responses: responseCount };
    });

    const weeklyComparison = Array.from({ length: 4 }).map((_, i) => {
      const start = new Date();
      start.setDate(now.getDate() - (28 - i * 7));
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const engagement = applications.filter(
        (a) => a.created_at >= start && a.created_at < end
      ).length;
      return { week: `Week ${i + 1}`, engagement };
    });

    const responseDistribution = applications.reduce<Record<string, number>>(
      (acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      },
      {}
    );

    const engagementMetrics = {
      openRate: totalViews,
      clickRate: totalResponses,
      applicationRate: totalConversions,
    };

    const stats = {
      totals: {
        totalCandidatesViewed: totalViews,
        responseRate,
        averageResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        conversionRate,
      },
      trends,
      weeklyComparison,
      responseDistribution,
      engagementMetrics,
    };

    logger.info(
      { instituteId: jwtPayload.id, jobId },
      "Job stats retrieved successfully"
    );
    return c.json(stats, 200);
  } catch (err: unknown) {
    logger.error(
      { err, instituteId: jwtPayload?.id, jobId },
      "Error retrieving job stats"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

export { jobRouter as privJobRouter };
