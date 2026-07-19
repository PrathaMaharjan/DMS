import { z } from "zod";

export const treatmentSchema = z.object({
  locationId: z.string().uuid("Missing or invalid location"),
  name: z.string().min(1, "Treatment name is required"),
  category: z.enum(["preventive", "restorative", "cosmetic", "surgical", "orthodontic", "periodontic", "endodontic", "pediatric"]),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0")
    .max(480, "Duration seems too long - please double check"),
  priceCents: z.number().int("Price must be a whole number").nonnegative("Price cannot be negative"),
  sessions: z.number().int("Sessions must be a whole number").positive("Sessions must be at least 1").default(1),
  anesthesia: z.enum(["none", "local", "sedation", "general"]).default("none"),
  recoveryTime: z.string().optional(),
  description: z.string().optional(),
  procedureSteps: z.array(z.string()).optional(),
  aftercareInstructions: z.array(z.string()).optional(),
});

export type TreatmentInput = z.infer<typeof treatmentSchema>;

// All fields optional for partial updates. locationId is deliberately
// excluded - moving a treatment to a different location isn't a supported
// operation; delete and recreate instead.
export const updateTreatmentSchema = z.object({
  name: z.string().min(1, "Treatment name is required").optional(),
  category: z.enum(["preventive", "restorative", "cosmetic", "surgical", "orthodontic", "periodontic", "endodontic", "pediatric"]).optional(),
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .positive("Duration must be greater than 0")
    .max(480, "Duration seems too long - please double check")
    .optional(),
  priceCents: z.number().int("Price must be a whole number").nonnegative("Price cannot be negative").optional(),
  sessions: z.number().int("Sessions must be a whole number").positive("Sessions must be at least 1").optional(),
  anesthesia: z.enum(["none", "local", "sedation", "general"]).optional(),
  recoveryTime: z.string().optional(),
  description: z.string().optional(),
  procedureSteps: z.array(z.string()).optional(),
  aftercareInstructions: z.array(z.string()).optional(),
});

export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;