import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { patients } from "./patients";
import { appointmentTypes, appointments } from "./scheduling";

export const orgStatusEnum = pgEnum("org_status", [
  "trial",
  "active",
  "suspended",
  "cancelled",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    status: orgStatusEnum("status").notNull().default("trial"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("organizations_status_idx").on(table.status),
  }),
);

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index("locations_org_id_idx").on(table.orgId),
    orgNameUnique: unique("locations_org_id_name_unique").on(
      table.orgId,
      table.name,
    ),
  }),
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").notNull().references(() => organizations.id),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index("users_org_id_idx").on(table.orgId),
  })
);

export const staffRoleEnum = pgEnum("staff_role", ["owner", "clinical", "front_office"]);

// owner        - full access: staff, settings, billing, reports, all patients at their locations
// clinical     - dentist + hygienist merged. Note: in most places a hygienist legally
//                can't diagnose or finalize a treatment plan - the system doesn't enforce
//                that boundary itself, since both share one role. Worth keeping in mind
//                if this ever needs tighter enforcement later.
// front_office - front desk + day-to-day billing: scheduling, check-in, payments, claims

// A staff member's role is scoped to a specific location, not the whole org -
// this is what lets a DSO office manager see only the locations they're assigned to.
export const userLocationRoles = pgTable(
  "user_location_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    locationId: uuid("location_id").notNull().references(() => locations.id),
    role: staffRoleEnum("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userLocationUnique: unique().on(table.userId, table.locationId),
    locationIdx: index("user_location_roles_location_id_idx").on(table.locationId),
  })
);

// ---------- Relations (Drizzle query-API layer, not database FKs) ----------
// These reference tables from ./patients and ./scheduling, which in turn import
// FROM this file for their own foreign keys - a circular import. This is safe:
// the callback below only runs after every module has finished loading, not
// during the import itself. Verified working further down this conversation.

export const organizationsRelations = relations(organizations, ({ many }) => ({
  locations: many(locations),
  users: many(users),
  patients: many(patients),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [locations.orgId],
    references: [organizations.id],
  }),
  staffRoles: many(userLocationRoles),
  patients: many(patients),
  appointmentTypes: many(appointmentTypes),
  appointments: many(appointments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  locationRoles: many(userLocationRoles),
  appointmentsAsProvider: many(appointments),
}));

export const userLocationRolesRelations = relations(userLocationRoles, ({ one }) => ({
  user: one(users, {
    fields: [userLocationRoles.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [userLocationRoles.locationId],
    references: [locations.id],
  }),
}));