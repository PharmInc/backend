import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import { getAllUsers, getUserById, searchUsers } from "./route.js";

const userRouter = new OpenAPIHono();
const logger = getServiceLogger("User");

type UserQuery = {
  page?: string;
  pageSize?: string;
  specialty?: string;
  location?: string;
  role?: string;
  verified?: string;
  gender?: string;
  name?: string;
};

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

  // Build Prisma filter
  const where: Record<string, unknown> = {};
  if (query.specialty) where.specialty = query.specialty;
  if (query.location) where.location = query.location;
  if (query.role) where.role = query.role;
  if (query.verified !== undefined) {
    if (query.verified === "true") where.verified = true;
    else if (query.verified === "false") where.verified = false;
  }
  if (query.gender) where.gender = query.gender;
  if (query.name) where.name = { contains: query.name, mode: "insensitive" };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
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
    const user = await prisma.user.findUnique({ where: { id } });
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
  let query: { q: string; page?: string; pageSize?: string };
  try {
    query = c.req.valid("query");
  } catch (err) {
    logger.warn({ err }, "Invalid search query parameters");
    return c.json({ error: "Invalid query parameters" }, 400);
  }
  const { q } = query;
  const page = parseInt(query.page || "1");
  const pageSize = parseInt(query.pageSize || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Search by name, specialty, or location (case-insensitive, partial match)
  const where = {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { specialty: { contains: q, mode: "insensitive" as const } },
      { location: { contains: q, mode: "insensitive" as const } },
    ],
  };

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    logger.info({ q, page, pageSize, total }, "Fetched users search results");
    return c.json({ users, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query }, "Database error during searchUsers");
    return c.json({ error: "Database error" }, 500);
  }
});

export { userRouter as pubUserRouter };
