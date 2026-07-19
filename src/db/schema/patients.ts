import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations, locations } from "./tenancy";
import { appointments } from "./scheduling";
import { ledgerEntries } from "./billing";
import { odontogramEntries } from "./clinical";

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    dob: date("dob"),
    phone: text("phone"),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    orgLocationIdx: index("patients_org_location_idx").on(
      table.orgId,
      table.locationId,
    ),
    orgLastNameIdx: index("patients_org_last_name_idx").on(
      table.orgId,
      table.lastName,
    ),
    orgPhoneIdx: index("patients_org_phone_idx").on(table.orgId, table.phone),
  }),
);

export const patientsRelations = relations(patients, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [patients.orgId],
    references: [organizations.id],
  }),
  odontogramEntries: many(odontogramEntries),
  ledgerEntries: many(ledgerEntries),
  homeLocation: one(locations, {
    fields: [patients.locationId],
    references: [locations.id],
  }),
  appointments: many(appointments),
}));
