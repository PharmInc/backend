import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import {
  getAllInstitutes,
  getInstituteById,
  searchInstitutes,
} from "./route.js";
import { Prisma } from "@prisma/client";

const instituteRouter = new OpenAPIHono();
const logger = getServiceLogger("Institute");

instituteRouter.openapi(searchInstitutes, async (c) => {
  let query: Record<string, string | undefined>;
  try {
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid search query parameters");
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const { name, specialty, location, role, verified } = query;
  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: Prisma.InstituteWhereInput = {};

  // Name search
  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  // Specialties search (comma-separated)
  if (specialty) {
    const specialtyArray = specialty.split(",").map((s) => s.trim());
    where.specialties = {
      some: {
        OR: specialtyArray.map((s) => ({
          name: { equals: s, mode: "insensitive" },
        })),
      },
    };
  }

  // Other filters
  if (location) where.location = { equals: location, mode: "insensitive" };
  if (role) where.role = role as Prisma.InstituteWhereInput["role"];
  if (verified !== undefined) where.verified = verified === "true";

  try {
    const [institutes, total] = await Promise.all([
      prisma.institute.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: { specialties: true },
      }),
      prisma.institute.count({ where }),
    ]);

    logger.info(
      { query, page, pageSize, total },
      "Fetched institutes search results"
    );
    return c.json({ institutes, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during searchInstitutes");
    return c.json({ error: "Database error" }, 500);
  }
});
// GET ALL INSTITUTES
instituteRouter.openapi(getAllInstitutes, async (c) => {
  let query: Record<string, string | undefined>;
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

  const where: Prisma.InstituteWhereInput = {};

  if (query.specialty) {
    const specialtiesArray = query.specialty.split(",").map((s) => s.trim());
    where.specialties = {
      some: {
        OR: specialtiesArray.map((s) => ({
          name: { equals: s, mode: "insensitive" },
        })),
      },
    };
  }

  if (query.location) {
    where.location = { equals: query.location, mode: "insensitive" };
  }

  if (query.role) {
    where.role = query.role as Prisma.InstituteWhereInput["role"];
  }

  if (query.verified !== undefined) {
    where.verified = query.verified === "true";
  }

  if (query.name) {
    where.name = { contains: query.name, mode: "insensitive" };
  }

  try {
    const [institutes, total] = await Promise.all([
      prisma.institute.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: { specialties: true }, // include specialties in response
      }),
      prisma.institute.count({ where }),
    ]);

    logger.info(
      { page, pageSize, total, filters: where },
      "Fetched institutes list"
    );
    return c.json({ institutes, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during getAllInstitutes");
    return c.json({ error: "Database error" }, 500);
  }
});

// GET INSTITUTE BY ID
instituteRouter.openapi(getInstituteById, async (c) => {
  let param: { id: string };
  try {
    param = c.req.valid("param");
  } catch (err) {
    logger.warn({ err }, "Invalid institute id param");
    return c.json({ error: "Institute not found" }, 404);
  }

  const id = param.id;

  try {
    const institute = await prisma.institute.findUnique({
      where: { id },
      include: { specialties: true },
    });

    if (!institute) {
      logger.warn({ id }, "Institute not found");
      return c.json({ error: "Institute not found" }, 404);
    }

    logger.info({ id }, "Fetched institute by id");
    return c.json(institute, 200);
  } catch (err) {
    logger.error({ err, id }, "Database error during getInstituteById");
    return c.json({ error: "Database error" }, 500);
  }
});

// SEARCH INSTITUTES

export { instituteRouter as pubInstituteRouter };
