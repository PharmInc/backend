import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import { getAllUsers, getUserById, searchUsers } from "./route.js";
import { UserQuery } from "../../../types/user.js";
import { Prisma } from "@prisma/client";

const userRouter = new OpenAPIHono();
const logger = getServiceLogger("User");

userRouter.openapi(getAllUsers, async (c) => {
  let query: UserQuery;
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

  const where: Record<string, unknown> = {};
  if (query.specialties) {
    where.specialties = {
      some: { name: { equals: query.specialties, mode: "insensitive" } },
    };
  }
  if (query.location)
    where.location = { equals: query.location, mode: "insensitive" };
  if (query.role) where.role = query.role;
  if (query.verified !== undefined) {
    if (query.verified === "true") where.verified = true;
    else if (query.verified === "false") where.verified = false;
  }
  if (query.gender)
    where.gender = { equals: query.gender, mode: "insensitive" };
  if (query.name) where.name = { contains: query.name, mode: "insensitive" };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: { specialties: true }, // include specialties in result
      }),
      prisma.user.count({ where }),
    ]);
    logger.info(
      { page, pageSize, total, filters: where },
      "Fetched users list"
    );
    return c.json({ users, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during getAllUsers");
    return c.json({ error: "Database error" }, 500);
  }
});

userRouter.openapi(getUserById, async (c) => {
  let param: { id: string };
  try {
    param = c.req.valid("param");
  } catch (err) {
    logger.warn({ err }, "Invalid user id param");
    return c.json({ error: "User not found" }, 404);
  }
  const id = param.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { specialties: true }, // include specialties
    });
    if (!user) {
      logger.warn({ id }, "User not found");
      return c.json({ error: "User not found" }, 404);
    }
    logger.info({ id }, "Fetched user by id");
    return c.json(user, 200);
  } catch (err) {
    logger.error({ err, id }, "Database error during getUserById");
    return c.json({ error: "Database error" }, 500);
  }
});

userRouter.openapi(searchUsers, async (c) => {
  let query: UserQuery;
  try {
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid search query parameters");
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const { name, specialties, location, role, verified, gender } = query;
  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Build Prisma filter
  const where: Prisma.UserWhereInput = {};

  // Name search
  if (name) {
    where.name = { contains: name, mode: "insensitive" };
  }

  // Filter specialties (comma-separated string to array)
  if (specialties) {
    const specialtyArray = specialties.split(",").map((s) => s.trim());
    if (specialtyArray.length > 0) {
      where.specialties = {
        some: {
          OR: specialtyArray.map((s) => ({
            name: { equals: s, mode: "insensitive" },
          })),
        },
      };
    }
  }

  // Other filters
  if (location) where.location = { equals: location, mode: "insensitive" };
  if (role) where.role = role as Prisma.UserWhereInput["role"];
  if (verified !== undefined) where.verified = verified === "true";
  if (gender) where.gender = { equals: gender, mode: "insensitive" };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
        include: { specialties: true },
      }),
      prisma.user.count({ where }),
    ]);

    logger.info(
      { query, page, pageSize, total },
      "Fetched users search results"
    );
    return c.json({ users, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during searchUsers");
    return c.json({ error: "Database error" }, 500);
  }
});

export { userRouter as pubUserRouter };
