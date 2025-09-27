import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import {
  getAllJobs,
  getJobById,
  getJobsByInstitution,
  searchJobs,
} from "./route.js";
import { Prisma } from "@prisma/client";

const jobRouter = new OpenAPIHono();
const logger = getServiceLogger("Job");

// GET all jobs with optional filters

jobRouter.openapi(getAllJobs, async (c) => {
  let query;
  try {
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid query parameters");
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.JobWhereInput = {};

  if (query.jobType) where.jobType = query.jobType;
  if (query.location)
    where.workLocation = { equals: query.location, mode: "insensitive" };
  if (query.experienceLevel) where.experienceLevel = query.experienceLevel;
  if (query.status) where.status = query.status;

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          specialties: true,
          institute: {
            include: { specialties: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);
    logger.info({ page, pageSize, total, filters: where }, "Fetched jobs list");
    return c.json({ jobs, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during getAllJobs");
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(getJobById, async (c) => {
  let param: { id: string };
  try {
    param = c.req.valid("param");
  } catch (err) {
    logger.warn({ err }, "Invalid job ID param");
    return c.json({ error: "Job not found" }, 404);
  }

  const id = param.id;

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        specialties: true,
        institute: {
          include: {
            specialties: true,
          },
        },
      },
    });

    if (!job) {
      logger.warn({ id }, "Job not found");
      return c.json({ error: "Job not found" }, 404);
    }
    logger.info({ id }, "Fetched job by ID");
    return c.json(job, 200);
  } catch (err) {
    logger.error({ err, id }, "Database error during getJobById");
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(getJobsByInstitution, async (c) => {
  let param: { instituteId: string };
  let query;
  try {
    param = c.req.valid("param");
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid request parameters");
    return c.json({ error: "Invalid parameters" }, 400);
  }

  const instituteId = param.instituteId;
  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { instituteId },
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          specialties: true,
          institute: {
            include: { specialties: true },
          },
        },
      }),
      prisma.job.count({ where: { instituteId } }),
    ]);

    logger.info(
      { instituteId, page, pageSize, total },
      "Fetched jobs by institution"
    );
    return c.json({ jobs, page, pageSize, total }, 200);
  } catch (err) {
    logger.error(
      { err, instituteId },
      "Database error during getJobsByInstitution"
    );
    return c.json({ error: "Database error" }, 500);
  }
});

jobRouter.openapi(searchJobs, async (c) => {
  let query;
  try {
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid search query parameters");
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const { q, location, jobType, experienceLevel, specialtyId } = query;
  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.JobWhereInput = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { requirements: { contains: q, mode: "insensitive" } },
    ];
  }

  if (location) where.workLocation = { equals: location, mode: "insensitive" };
  if (jobType) where.jobType = jobType;
  if (experienceLevel) where.experienceLevel = experienceLevel;
  if (specialtyId) {
    where.specialties = {
      some: { id: specialtyId },
    };
  }

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: {
          specialties: true,
          institute: {
            include: { specialties: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);
    logger.info({ query, page, pageSize, total }, "Fetched job search results");
    return c.json({ jobs, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during searchJobs");
    return c.json({ error: "Database error" }, 500);
  }
});

export { jobRouter as pubJobRouter };
