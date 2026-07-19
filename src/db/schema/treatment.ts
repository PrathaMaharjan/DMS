import { pgTable, uuid, text, integer, timestamp, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { locations } from "./tenancy";

export const treatmentCategoryEnum = pgEnum("treatment_category", [
  "preventive",
  "restorative",
  "cosmetic",
  "surgical",
  "orthodontic",
  "periodontic",
  "endodontic",
  "pediatric",
]);

export const anesthesiaTypeEnum = pgEnum("anesthesia_type", ["none", "local", "sedation", "general"]);

export const treatments = pgTable(
  "treatments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: treatmentCategoryEnum("category").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    priceCents: integer("price_cents").notNull(),
    sessions: integer("sessions").notNull().default(1),
    anesthesia: anesthesiaTypeEnum("anesthesia").notNull().default("none"),
    recoveryTime: text("recovery_time"),
    description: text("description"),
    procedureSteps: text("procedure_steps").array(),
    aftercareInstructions: text("aftercare_instructions").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    locationIdx: index("treatments_location_id_idx").on(table.locationId),
    locationNameUnique: unique("treatments_location_id_name_unique").on(table.locationId, table.name),
  })
);

export const treatmentsRelations = relations(treatments, ({ one }) => ({
  location: one(locations, { fields: [treatments.locationId], references: [locations.id] }),
}));