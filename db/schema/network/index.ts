import { uuid, timestamp, pgTable, boolean, text } from "drizzle-orm/pg-core";
import { authTable } from "../auth";

export const base = {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),

  id1: uuid("id1")
    .notNull()
    .references(() => authTable.id),
  id1_poster_type: text("id1_poster_type").notNull().default("user"),
  id2: uuid("id2")
    .notNull()
    .references(() => authTable.id),
  id2_poster_type: text("id2_poster_type").notNull().default("user"),
};

export const followTable = pgTable("follow", {
  ...base,
});

export const conectTable = pgTable("connect", {
  ...base,
  accepted: boolean("accepted").default(false),
});
