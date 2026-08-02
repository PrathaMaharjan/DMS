import { db } from "@/db";
import { appointments, ledgerEntries, patients, treatments } from "@/db/schema";
import { requireSession, SessionError } from "@/lib/auth/get-session";
import { addLedgerEntrySchema } from "@/lib/validators/billing";
import { and, desc, eq, sql } from "drizzle-orm";

export type LedgerErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "SERVER_ERROR";

export type AddLedgerEntryResult =
  | { success: true; entryId: string; newBalanceCents: number }
  | { success: false; error: string; code: LedgerErrorCode };

export async function addLedgerEntry(
  input: unknown,
): Promise<AddLedgerEntryResult> {
  try {
    const session = await requireSession();

    const parsed = addLedgerEntrySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    // "Payment method" only makes sense for a real payment - the form
    // itself hides that field for Charge/Adjustment, enforced here too
    // so the API can't be called with a mismatched combination.
    if (data.type === "payment" && !data.paymentMethod) {
      return {
        success: false,
        error: "Please select a payment method.",
        code: "VALIDATION",
      };
    }

    const patient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, data.patientId),
        eq(patients.orgId, session.orgId),
      ),
    });
    if (!patient) {
      return { success: false, error: "Patient not found.", code: "NOT_FOUND" };
    }
    // Charge INCREASES what's owed. Payment and Adjustment both DECREASE
    // it - same direction, different meaning (money received vs. a
    // discount/write-off) - matching the form's own "reduces balance" note.
    const signedAmount =
      data.type === "charge" ? data.amountCents : -data.amountCents;

    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        orgId: session.orgId,
        locationId: data.locationId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        type: data.type,
        amountCents: signedAmount,
        paymentMethod: data.type === "payment" ? data.paymentMethod : null,
      })
      .returning();
    const [balanceResult] = await db
      .select({
        balance: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`,
      })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.patientId, data.patientId));

    return {
      success: true,
      entryId: entry.id,
      newBalanceCents: balanceResult.balance,
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong adding the ledger entry.",
      code: "SERVER_ERROR",
    };
  }
}

// get patent ledger history 
export type LedgerHistoryResult =
  | {
      success: true;
      summary: {
        totalChargedCents: number;
        totalPaidCents: number;
        balanceDueCents: number;
      };
      entries: {
        id: string;
        type: string;
        amountCents: number;
        paymentMethod: string | null;
        // note: string | null;
        appointmentTreatmentName: string | null;
        createdAt: Date;
      }[];
    }
  | { success: false; error: string; code: LedgerErrorCode };

export async function getLedgerHistory(patientId: string): Promise<LedgerHistoryResult> {
  try {
    const session = await requireSession();

    const patient = await db.query.patients.findFirst({
      where: and(eq(patients.id, patientId), eq(patients.orgId, session.orgId)),
    });
    if (!patient) {
      return { success: false, error: "Patient not found.", code: "NOT_FOUND" };
    }

    // FIXED: coalesce() now wraps sum(...) filter (...) FIRST, guaranteeing
    // a real 0 before abs() ever runs - the original had abs() wrapping
    // the raw filtered sum directly, so abs(NULL) stayed NULL even after
    // the outer coalesce, which is what caused the 500.
    const [summaryResult,entries] = await Promise.all([
      db
        .select({
          totalChargedCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'charge'), 0)::int`,
          totalPaidCents: sql<number>`abs(coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'payment'), 0))::int`,
          balanceDueCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`,
        })
        .from(ledgerEntries)
        .where(eq(ledgerEntries.patientId, patientId)),
      db
        .select({
          id: ledgerEntries.id,
          type: ledgerEntries.type,
          amountCents: ledgerEntries.amountCents,
          paymentMethod: ledgerEntries.paymentMethod,
          // note: ledgerEntries.note,
          appointmentTreatmentName: treatments.name,
          createdAt: ledgerEntries.createdAt,
        })
        .from(ledgerEntries)
        .leftJoin(appointments, eq(ledgerEntries.appointmentId, appointments.id))
        .leftJoin(treatments, eq(appointments.treatmentId, treatments.id))
        .where(eq(ledgerEntries.patientId, patientId))
        .orderBy(desc(ledgerEntries.createdAt)),
    ]);

    // Defensive fallback - guarantees `summary` is always a real object,
    // never undefined, even if this patient somehow has zero entries and
    // the aggregate query returns an empty array instead of one zeroed row.
    const summary = summaryResult[0] ?? { totalChargedCents: 0, totalPaidCents: 0, balanceDueCents: 0 };

    return {
      success: true,
      summary,
      entries,
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading ledger history.", code: "SERVER_ERROR" };
  }
}

// get stats 
export type BillingStatsErrorCode = "UNAUTHORIZED" | "SERVER_ERROR";

export type BillingStatsResult =
  | {
      success: true;
      stats: {
        totalChargedCents: number;
        totalCollectedCents: number;
        outstandingDuesCents: number;
        patientsWithDuesCount: number;
      };
    }
  | { success: false; error: string; code: BillingStatsErrorCode };

export async function getBillingStats(locationId: string): Promise<BillingStatsResult> {
  try {
    const session = await requireSession();

    const [orgTotals, perPatientBalances] = await Promise.all([
      db
        .select({
          totalChargedCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'charge'), 0)::int`,
          totalCollectedCents: sql<number>`abs(coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'payment'), 0))::int`,
        })
        .from(ledgerEntries)
        .innerJoin(patients, eq(ledgerEntries.patientId, patients.id))
        .where(and(eq(patients.orgId, session.orgId), eq(patients.locationId, locationId))),
      db
        .select({
          patientId: patients.id,
          balanceCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`,
        })
        .from(patients)
        .leftJoin(ledgerEntries, eq(ledgerEntries.patientId, patients.id))
        .where(and(eq(patients.orgId, session.orgId), eq(patients.locationId, locationId)))
        .groupBy(patients.id),
    ]);

    const outstandingDuesCents = perPatientBalances.reduce((sum, p) => sum + Math.max(p.balanceCents, 0), 0);
    const patientsWithDuesCount = perPatientBalances.filter((p) => p.balanceCents > 0).length;

    return {
      success: true,
      stats: {
        totalChargedCents: orgTotals[0]?.totalChargedCents ?? 0,
        totalCollectedCents: orgTotals[0]?.totalCollectedCents ?? 0,
        outstandingDuesCents,
        patientsWithDuesCount,
      },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading billing stats.", code: "SERVER_ERROR" };
  }
}

export type BillingPatientsErrorCode = "UNAUTHORIZED" | "SERVER_ERROR";

export type BillingPatientRow = {
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  lastActivity: Date | null;
  chargedCents: number;
  paidCents: number;
  balanceCents: number;
};

export type BillingPatientsResult =
  | { success: true; patients: BillingPatientRow[]; pagination: { total: number; limit: number; offset: number } }
  | { success: false; error: string; code: BillingPatientsErrorCode };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getBillingPatients(
  locationId: string,
  options?: { search?: string; balanceFilter?: "all" | "due" | "settled"; limit?: number; offset?: number }
): Promise<BillingPatientsResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(Math.max(options?.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = Math.max(options?.offset ?? 0, 0);

    const conditions = [eq(patients.orgId, session.orgId), eq(patients.locationId, locationId)];
    if (options?.search) {
      conditions.push(
        sql`(${patients.firstName} || ' ' || ${patients.lastName} ilike ${"%" + options.search + "%"} or ${patients.phone} ilike ${"%" + options.search + "%"})`
      );
    }
        const rows = await db
      .select({
        patientId: patients.id,
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        patientPhone: patients.phone,
        lastActivity: sql<Date | null>`max(${ledgerEntries.createdAt})`,
        chargedCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'charge'), 0)::int`,
        paidCents: sql<number>`abs(coalesce(sum(${ledgerEntries.amountCents}) filter (where ${ledgerEntries.type} = 'payment'), 0))::int`,
        balanceCents: sql<number>`coalesce(sum(${ledgerEntries.amountCents}), 0)::int`,
      })
      .from(patients)
      .leftJoin(ledgerEntries, eq(ledgerEntries.patientId, patients.id))
      .where(and(...conditions))
      .groupBy(patients.id, patients.firstName, patients.lastName, patients.phone);

          // Balance filter applied after aggregation, since the balance itself
    // only exists once the sums are computed - can't filter on it in the
    // same WHERE clause that produces it.
    let filtered = rows;
    if (options?.balanceFilter === "due") {
      filtered = rows.filter((p) => p.balanceCents > 0);
    } else if (options?.balanceFilter === "settled") {
      filtered = rows.filter((p) => p.balanceCents <= 0);
    }

    const total = filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return { success: true, patients: paged, pagination: { total, limit, offset } };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading patient billing.", code: "SERVER_ERROR" };
  }
}