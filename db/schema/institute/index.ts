import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const instituteTable = pgTable("institute", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),

  name: text("name").notNull().unique(),
  location: text("location").notNull(),
  type: text("type").notNull(),
  email: text("email").notNull().unique(),

  verified: boolean("verified").default(false),

  employeesCount: text("employees_count"),
  areaOfExpertise: text("area_of_expertise"),

  profilePicture: text("profile_picture"),
  bannerPicture: text("banner_picture"),

  contactEmail: text("contact_email"),
  contactNumber: text("contact_number"),

  bio: text("bio"),
  about: text("about"),
  followers: integer("followers").default(0),
});
