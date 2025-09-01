import {
  uuid,
  timestamp,
  text,
  pgTable,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { authTable } from "../auth";
import { jobTable } from "../job";

export const basePost = {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  content: text("content").notNull(),

  reactions: integer("reactions"),
  shares: integer("shares"),
  saves: integer("saves"),

  auth: uuid("auth").references(() => authTable.id),
  posterType: text("poster_type").notNull().default("user"),
};

export const postTable = pgTable("post", {
  ...basePost,

  title: text("title").notNull(),
  attachmentId: text("attachment_id"),
});

export const commentTable = pgTable("comment", {
  ...basePost,

  postId: uuid("post_id")
    .references(() => postTable.id)
    .notNull(),

  parentId: uuid("parent_id").references(() => commentTable.id),
});

export const applicationTable = pgTable("application", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  jobId: uuid("job_id")
    .notNull()
    .references(() => jobTable.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => authTable.id),

  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),

  status: text("status").notNull().default("pending"),
  notes: text("notes"),

  additionalInfo: jsonb("additional_info"),

  // Timestamps for status tracking
  appliedAt: timestamp("applied_at", { withTimezone: true }).defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
});
