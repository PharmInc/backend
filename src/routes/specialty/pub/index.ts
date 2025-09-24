import { OpenAPIHono } from "@hono/zod-openapi";
import prisma from "../../../lib/prisma-client.js";
import { getServiceLogger } from "../../../lib/logging-client.js";
import { searchSpecialties } from "./route.js";

const specialtyRouter = new OpenAPIHono();
const logger = getServiceLogger("Specialty");

specialtyRouter.openapi(searchSpecialties, async (c) => {
  const q = c.req.query("q")?.toLowerCase() || "";
  const page = parseInt(c.req.query("page") || "1");
  const pageSize = parseInt(c.req.query("pageSize") || "20");
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    const [specialties, total] = await Promise.all([
      prisma.specialty.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.specialty.count({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
      }),
    ]);

    logger.info(
      { query: q, page, pageSize, total },
      "Fetched specialties search results"
    );
    return c.json({ specialties, page, pageSize, total }, 200);
  } catch (err) {
    logger.error({ err, query: q }, "Database error during searchSpecialties");
    return c.json({ error: "Database error" }, 500);
  }
});

export { specialtyRouter as pubSpecialtyRouter };
