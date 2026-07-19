import { db } from "@/db";
import { locations, treatments } from "@/db/schema";
import { requireSession } from "@/lib/auth/get-session";
import { treatmentSchema, updateTreatmentSchema } from "@/lib/validators/treatments";
import { and, eq, sql } from "drizzle-orm";

export type TreatmentErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "DUPLICATE"
  | "SERVER_ERROR";

function getPgErrorCode(err: unknown): string | undefined {
  return (
    (err as { cause?: { code?: string } })?.cause?.code ??
    (err as { code?: string })?.code
  );
}
async function findOwnedTreatment(treatmentId: string, orgId: string) {
  const rows = await db
    .select({ id: treatments.id })
    .from(treatments)
    .innerJoin(locations, eq(treatments.locationId, locations.id))
    .where(and(eq(treatments.id, treatmentId), eq(locations.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}
export type CreateTreatmentResult =
  | { success: true; treatment: typeof treatments.$inferSelect }
  | { success: false; error: string; code: TreatmentErrorCode };

export async function createTreatment(
  input: unknown,
): Promise<CreateTreatmentResult> {
  try {
    const session = await requireSession();
    if (!session) {
      Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = treatmentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const location = await db.query.locations.findFirst({
      where: and(
        eq(locations.id, data.locationId),
        eq(locations.orgId, session.orgId),
      ),
    });
    if (!location) {
      return {
        success: false,
        error: "Location not found.",
        code: "NOT_FOUND",
      };
    }

    const [treatment] = await db
      .insert(treatments)
      .values({
        locationId: data.locationId,
        name: data.name,
        category: data.category,
        durationMinutes: data.durationMinutes,
        priceCents: data.priceCents,
        sessions: data.sessions,
        anesthesia: data.anesthesia,
        recoveryTime: data.recoveryTime,
        description: data.description,
        procedureSteps: data.procedureSteps,
        aftercareInstructions: data.aftercareInstructions,
      })
      .returning();

    return { success: true, treatment };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return {
        success: false,
        error: "You must be logged in.",
        code: "UNAUTHORIZED",
      };
    }
    if (getPgErrorCode(err) === "23505") {
      return {
        success: false,
        error: "A treatment with this name already exists at this location.",
        code: "DUPLICATE",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong creating the treatment.",
      code: "SERVER_ERROR",
    };
  }
}

export type GetTreatmentsResult =
  | {
      success: true;
      treatments: (typeof treatments.$inferSelect)[];
      pagination: { total: number; limit: number; offset: number };
    }
  | { success: false; error: string; code: TreatmentErrorCode };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
export async function getTreatments(
  locationId?: string,
  options?: { limit?: number; offset?: number },
): Promise<GetTreatmentsResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(options?.offset ?? 0, 0);

    const whereClause = locationId
      ? and(
          eq(treatments.locationId, locationId),
          eq(locations.orgId, session.orgId),
        )
      : eq(locations.orgId, session.orgId);
    const [results, countResult] = await Promise.all([
      db
        .select({
          id: treatments.id,
          locationId: treatments.locationId,
          name: treatments.name,
          category: treatments.category,
          durationMinutes: treatments.durationMinutes,
          priceCents: treatments.priceCents,
          sessions: treatments.sessions,
          anesthesia: treatments.anesthesia,
          recoveryTime: treatments.recoveryTime,
          description: treatments.description,
          procedureSteps: treatments.procedureSteps,
          aftercareInstructions: treatments.aftercareInstructions,
          createdAt: treatments.createdAt,
          updatedAt: treatments.updatedAt,
        })
        .from(treatments)
        .innerJoin(locations, eq(treatments.locationId, locations.id))
        .where(whereClause)
        .orderBy(treatments.name)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(treatments)
        .innerJoin(locations, eq(treatments.locationId, locations.id))
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      success: true,
      treatments: results,
      pagination: { total, limit, offset },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return {
        success: false,
        error: "You must be logged in.",
        code: "UNAUTHORIZED",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading treatments.",
      code: "SERVER_ERROR",
    };
  }
}
// ------------------------------------update --------------------------------
export type UpdateTreatmentResult =
  | { success: true; treatment: typeof treatments.$inferSelect }
  | { success: false; error: string; code: TreatmentErrorCode };

  export async function updateTreatment(treatmentId: string, input: unknown): Promise<UpdateTreatmentResult> {
  try {
    const session = await requireSession();

    const parsed = updateTreatmentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input.", code: "VALIDATION" };
    }

    const owned = await findOwnedTreatment(treatmentId, session.orgId);
    if (!owned) {
      return { success: false, error: "Treatment not found.", code: "NOT_FOUND" };
    }

    const [updated] = await db
      .update(treatments)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(treatments.id, treatmentId))
      .returning();
      return { success: true, treatment: updated };
       }
    catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (getPgErrorCode(err) === "23505") {
      return {
        success: false,
        error: "A treatment with this name already exists at this location.",
        code: "DUPLICATE",
      };
    }
    console.error(err);
    return { success: false, error: "Something went wrong updating the treatment.", code: "SERVER_ERROR" };
  }
}

// ----------------------------------------dekete------------------------------------------

export type DeleteTreatmentResult =
  | { success: true }
  | { success: false; error: string; code: TreatmentErrorCode };
export async function deleteTreatment(treatmentId: string): Promise<DeleteTreatmentResult> {
  try {
    const session = await requireSession();

    const owned = await findOwnedTreatment(treatmentId, session.orgId);
    if (!owned) {
      return { success: false, error: "Treatment not found.", code: "NOT_FOUND" };
    }

    await db.delete(treatments).where(eq(treatments.id, treatmentId));

    return { success: true };
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong deleting the treatment.", code: "SERVER_ERROR" };
  }
}
