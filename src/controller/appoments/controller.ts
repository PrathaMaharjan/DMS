// src/lib/controllers/appointments.controller.ts
import {
  eq,
  and,
  or,
  ne,
  lt,
  gt,
  inArray,
  isNull,
  sql,
  desc,
} from "drizzle-orm";
import { db } from "@/db";
import {
  patients,
  appointments,
  treatments,
  users,
  userLocationRoles,
  providerSchedules,
  locations,
} from "@/db/schema";
import { requireSession, SessionError } from "@/lib/auth/get-session";
import {
  assignAppointmentSchema,
  bookAppointmentSchema,
} from "@/lib/validators/appoments";
// import { bookAppointmentSchema } from "@/lib/validators/appointments";

export type BookAppointmentErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "DOUBLE_BOOKED"
  | "SERVER_ERROR";

export type BookAppointmentResult =
  | {
      success: true;
      appointmentId: string;
      patientId: string;
      wasNewPatient: boolean;
    }
  | { success: false; error: string; code: BookAppointmentErrorCode };

// Schedule-time check disabled for now, on purpose - every active clinical
// staff member at this location counts as a candidate, regardless of
// provider_schedules.
// async function findAvailableDoctor(
//   locationId: string,
//   startTime: Date,
//   endTime: Date
// ): Promise<string | null> {
//   const clinicalStaff = await db
//     .select({ userId: userLocationRoles.userId })
//     .from(userLocationRoles)
//     .innerJoin(users, eq(users.id, userLocationRoles.userId))
//     .where(
//       and(
//         eq(userLocationRoles.locationId, locationId),
//         eq(userLocationRoles.role, "clinical"),
//         eq(users.isActive, true),
//         isNull(users.deletedAt)
//       )
//     );

//   console.log("findAvailableDoctor - locationId used:", locationId);
//   console.log("findAvailableDoctor - clinical candidates found:", clinicalStaff);

//   if (clinicalStaff.length === 0) return null;

//   const candidateIds = clinicalStaff.map((d) => d.userId);

//   const busyDoctors = await db
//     .select({ providerId: appointments.providerId })
//     .from(appointments)
//     .where(
//       and(
//         inArray(appointments.providerId, candidateIds),
//         ne(appointments.status, "cancelled"),
//         lt(appointments.startTime, endTime),
//         gt(appointments.endTime, startTime)
//       )
//     );

//   console.log("findAvailableDoctor - busy doctors at this time:", busyDoctors);

//   const busyIds = new Set(busyDoctors.map((d) => d.providerId));
//   const availableId = candidateIds.find((id) => !busyIds.has(id));

//   console.log("findAvailableDoctor - final result:", availableId ?? null);

//   return availableId ?? null;
// }

async function findAvailableDoctor(
  locationId: string,
  startTime: Date,
  endTime: Date,
): Promise<string | null> {
  const dayOfWeek = startTime.getDay();
  const timeOfDay = startTime.toTimeString().slice(0, 8);

  // Scheduled to work THIS location, on THIS day of the week, during
  // THIS specific hour - AND actually active/not deleted. All three
  // conditions checked together in one query, not layered on after.
  const scheduledDoctors = await db
    .select({ userId: providerSchedules.userId })
    .from(providerSchedules)
    .innerJoin(
      userLocationRoles,
      eq(userLocationRoles.userId, providerSchedules.userId),
    )
    .innerJoin(users, eq(users.id, providerSchedules.userId))
    .where(
      and(
        eq(providerSchedules.locationId, locationId),
        eq(providerSchedules.dayOfWeek, dayOfWeek),
        lt(providerSchedules.startTime, timeOfDay),
        gt(providerSchedules.endTime, timeOfDay),
        eq(userLocationRoles.role, "clinical"),
        eq(users.isActive, true),
        isNull(users.deletedAt),
      ),
    );

  if (scheduledDoctors.length === 0) return null;

  const candidateIds = scheduledDoctors.map((d) => d.userId);

  const busyDoctors = await db
    .select({ providerId: appointments.providerId })
    .from(appointments)
    .where(
      and(
        inArray(appointments.providerId, candidateIds),
        ne(appointments.status, "cancelled"),
        lt(appointments.startTime, endTime),
        gt(appointments.endTime, startTime),
      ),
    );

  const busyIds = new Set(busyDoctors.map((d) => d.providerId));
  const availableId = candidateIds.find((id) => !busyIds.has(id));

  return availableId ?? null;
}
export async function bookAppointment(
  input: unknown,
): Promise<BookAppointmentResult> {
  try {
    const session = await requireSession();

    const parsed = bookAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const identifierMatch =
      data.email && data.email.trim() !== ""
        ? or(eq(patients.phone, data.phone), eq(patients.email, data.email))
        : eq(patients.phone, data.phone);

    const [existingPatient, treatment] = await Promise.all([
      db.query.patients.findFirst({
        where: and(eq(patients.orgId, session.orgId), identifierMatch),
      }),
      db.query.treatments.findFirst({
        where: eq(treatments.id, data.treatmentId),
      }),
    ]);

    if (!treatment) {
      return {
        success: false,
        error: "Selected treatment could not be found.",
        code: "NOT_FOUND",
      };
    }

    const startTime = new Date(
      `${data.preferredDate}T${data.preferredTime}:00`,
    );
    const endTime = new Date(
      startTime.getTime() + treatment.durationMinutes * 60_000,
    );

    // console.log("bookAppointment - data.locationId:", data.locationId);
    // console.log("bookAppointment - startTime:", startTime, "endTime:", endTime);

    let providerId = data.providerId;
    if (!providerId) {
      const available = await findAvailableDoctor(
        data.locationId,
        startTime,
        endTime,
      );
      if (!available) {
        return {
          success: false,
          error:
            "No dentist is available at that time. Please choose a different time.",
          code: "DOUBLE_BOOKED",
        };
      }
      providerId = available;
    }

    console.log("bookAppointment - providerId resolved to:", providerId);

    const result = await db.transaction(async (tx) => {
      let patient = existingPatient;
      let wasNewPatient = false;

      if (!patient) {
        const trimmedName = data.fullName.trim();
        const [firstName, ...rest] = trimmedName.split(" ");
        const lastName = rest.join(" ") || "-";

        const [newPatient] = await tx
          .insert(patients)
          .values({
            orgId: session.orgId,
            locationId: data.locationId,
            firstName,
            lastName,
            phone: data.phone,
            email: data.email || null,
            dob: data.dob || null,
          })
          .returning();
        patient = newPatient;
        wasNewPatient = true;
      }

      const conflict = await tx.query.appointments.findFirst({
        where: and(
          eq(appointments.providerId, providerId),
          ne(appointments.status, "cancelled"),
          lt(appointments.startTime, endTime),
          gt(appointments.endTime, startTime),
        ),
      });

      console.log("bookAppointment - final conflict check result:", conflict);

      if (conflict) {
        throw new Error("DOUBLE_BOOKED");
      }

      const [appointment] = await tx
        .insert(appointments)
        .values({
          locationId: data.locationId,
          patientId: patient.id,
          providerId,
          treatmentId: data.treatmentId,
          startTime,
          endTime,
          notes: data.notes || null,
          source: "staff",
          status: data.source === "staff" ? "confirmed" : "requested",
        })
        .returning();

      return {
        appointmentId: appointment.id,
        patientId: patient.id,
        wasNewPatient,
      };
    });

    return { success: true, ...result };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    if (err instanceof Error && err.message === "DOUBLE_BOOKED") {
      return {
        success: false,
        error:
          "This dentist is already booked at that time. Please choose a different time.",
        code: "DOUBLE_BOOKED",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong booking the appointment.",
      code: "SERVER_ERROR",
    };
  }
}

// ---------------get gending appoment --------------------------------
export type PendingReviewResult =
  | {
      success: true;
      appointments: {
        id: string;
        patientName: string;
        patientPhone: string | null;
        patientEmail: string | null;
        treatmentName: string;
        startTime: Date;
        source: string;
        notes: string | null;
      }[];
    }
  | { success: false; error: string; code: BookAppointmentErrorCode };

export async function getPendingAppointments(
  locationId: string,
): Promise<PendingReviewResult> {
  try {
    const session = await requireSession();

    // Same tenant-isolation pattern as getAppointments - scoped through
    // the location, since appointments has no direct orgId column.
    const whereClause = and(
      eq(appointments.locationId, locationId),
      eq(locations.orgId, session.orgId),
      eq(appointments.status, "requested"),
    );

    const results = await db
      .select({
        id: appointments.id,
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        patientPhone: patients.phone,
        patientEmail: patients.email,
        treatmentName: treatments.name,
        startTime: appointments.startTime,
        source: appointments.source,
        notes: appointments.notes,
      })
      .from(appointments)
      .innerJoin(locations, eq(appointments.locationId, locations.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(whereClause)
      .orderBy(appointments.startTime);

    return { success: true, appointments: results };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading pending appointments.",
      code: "SERVER_ERROR",
    };
  }
}

// ------------------ change status ----------------------------------------
export type UpdateStatusResult =
  | { success: true }
  | { success: false; error: string; code: BookAppointmentErrorCode };

const VALID_STATUSES = [
  "requested",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
];
export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
): Promise<UpdateStatusResult> {
  try {
    const session = await requireSession();

    if (!VALID_STATUSES.includes(status)) {
      return {
        success: false,
        error: "Invalid status value.",
        code: "VALIDATION",
      };
    }
    const existing = await db
      .select({ id: appointments.id })
      .from(appointments)
      .innerJoin(locations, eq(appointments.locationId, locations.id))
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(locations.orgId, session.orgId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        success: false,
        error: "Appointment not found.",
        code: "NOT_FOUND",
      };
    }

    await db
      .update(appointments)
      .set({ status: status as any })
      .where(eq(appointments.id, appointmentId));

    return { success: true };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong updating the appointment.",
      code: "SERVER_ERROR",
    };
  }
}

// ---------------------- assign doctor ------------------------------------
export type ReassignResult =
  | { success: true }
  | { success: false; error: string; code: BookAppointmentErrorCode };

export async function reassignAppointmentDoctor(
  appointmentId: string,
  newProviderId: string,
): Promise<ReassignResult> {
  try {
    const session = await requireSession();

    const existing = await db
      .select({
        id: appointments.id,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .innerJoin(locations, eq(appointments.locationId, locations.id))
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(locations.orgId, session.orgId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        success: false,
        error: "Appointment not found.",
        code: "NOT_FOUND",
      };
    }
    const { startTime, endTime } = existing[0];
    // Same double-booking check as bookAppointment, but explicitly
    // excludes THIS appointment - otherwise it would always "conflict"
    // with itself, since it's already booked against the old provider.
    const conflict = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.providerId, newProviderId),
        ne(appointments.id, appointmentId),
        ne(appointments.status, "cancelled"),
        lt(appointments.startTime, endTime),
        gt(appointments.endTime, startTime),
      ),
    });

    if (conflict) {
      return {
        success: false,
        error: "This dentist is already booked at that time.",
        code: "DOUBLE_BOOKED",
      };
    }

    await db
      .update(appointments)
      .set({ providerId: newProviderId })
      .where(eq(appointments.id, appointmentId));
    return { success: true };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong reassigning the appointment.",
      code: "SERVER_ERROR",
    };
  }
}

// get All appment execpt the pending

export type GetAppointmentsResult =
  | {
      success: true;
      appointments: {
        id: string;
        patientName: string;
        patientPhone: string | null;
        patientEmail: string | null;
        providerName: string;
        treatmentName: string;
        startTime: Date;
        endTime: Date;
        status: string;
        source: string;
        notes: string | null;
      }[];
      pagination: { total: number; limit: number; offset: number };
    }
  | { success: false; error: string; code: BookAppointmentErrorCode };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function getAppointments(
  locationId: string,
  options?: { status?: string; date?: string; limit?: number; offset?: number },
): Promise<GetAppointmentsResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(options?.offset ?? 0, 0);

    // Pending ("requested") appointments have their own dedicated review
    // queue (getPendingAppointments) - the main list excludes them by
    // default so they don't show up twice across two different screens.
    const conditions = [
      eq(appointments.locationId, locationId),
      eq(locations.orgId, session.orgId),
      ne(appointments.status, "requested"),
    ];
    if (options?.status)
      conditions.push(eq(appointments.status, options.status as any));
    if (options?.date) {
      const dayStart = new Date(`${options.date}T00:00:00`);
      const dayEnd = new Date(`${options.date}T23:59:59`);
      conditions.push(gt(appointments.startTime, dayStart));
      conditions.push(lt(appointments.startTime, dayEnd));
    }
    const whereClause = and(...conditions);

    const [results, countResult] = await Promise.all([
      db
        .select({
          id: appointments.id,
          patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
          patientPhone: patients.phone,
          patientEmail: patients.email,
          providerName: users.name,
          treatmentName: treatments.name,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          status: appointments.status,
          source: appointments.source,
          notes: appointments.notes,
        })
        .from(appointments)
        .innerJoin(locations, eq(appointments.locationId, locations.id))
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(users, eq(appointments.providerId, users.id))
        .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
        .where(whereClause)
        .orderBy(desc(appointments.startTime))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)
        .innerJoin(locations, eq(appointments.locationId, locations.id))
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    return {
      success: true,
      appointments: results,
      pagination: { total, limit, offset },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading appointments.",
      code: "SERVER_ERROR",
    };
  }
}

// -----------------------get dingle appoment ----------------------------
export type GetAppointmentResult =
  | {
      success: true;
      appointment: {
        id: string;
        patientId: string;
        patientName: string;
        patientPhone: string | null;
        patientEmail: string | null;
        providerId: string;
        providerName: string;
        treatmentId: string;
        treatmentName: string;
        startTime: Date;
        endTime: Date;
        status: string;
        source: string;
        notes: string | null;
      };
    }
  | { success: false; error: string; code: BookAppointmentErrorCode };

export async function getAppointment(
  appointmentId: string,
): Promise<GetAppointmentResult> {
  try {
    const session = await requireSession();

    const [result] = await db
      .select({
        id: appointments.id,
        patientId: patients.id,
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        patientPhone: patients.phone,
        patientEmail: patients.email,
        providerId: users.id,
        providerName: users.name,
        treatmentId: treatments.id,
        treatmentName: treatments.name,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        source: appointments.source,
        notes: appointments.notes,
      })
      .from(appointments)
      .innerJoin(locations, eq(appointments.locationId, locations.id))
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(users, eq(appointments.providerId, users.id))
      .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(locations.orgId, session.orgId),
        ),
      )
      .limit(1);
    if (!result) {
      return {
        success: false,
        error: "Appointment not found.",
        code: "NOT_FOUND",
      };
    }
    return { success: true, appointment: result };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading the appointment.",
      code: "SERVER_ERROR",
    };
  }
}

// ------------------assigned appoment to the existing patent --------------------------------

export type AssignAppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; error: string; code: BookAppointmentErrorCode };
export async function assignAppointmentToPatient(
  input: unknown,
): Promise<AssignAppointmentResult> {
  try {
    const session = await requireSession();

    const parsed = assignAppointmentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;
    const patient = await db.query.patients.findFirst({
      where: and(
        eq(patients.id, data.patientId),
        eq(patients.orgId, session.orgId),
        isNull(patients.deletedAt),
      ),
    });

    if (!patient) {
      return { success: false, error: "Patient not found.", code: "NOT_FOUND" };
    }
    const treatment = await db.query.treatments.findFirst({
      where: eq(treatments.id, data.treatmentId),
    });
    if (!treatment) {
      return {
        success: false,
        error: "Selected treatment could not be found.",
        code: "NOT_FOUND",
      };
    }

    const startTime = new Date(
      `${data.preferredDate}T${data.preferredTime}:00`,
    );
    const endTime = new Date(
      startTime.getTime() + treatment.durationMinutes * 60_000,
    );
    let providerId = data.providerId;
    if (!providerId) {
      const available = await findAvailableDoctor(
        data.locationId,
        startTime,
        endTime,
      );
      if (!available) {
        return {
          success: false,
          error:
            "No dentist is available at that time. Please choose a different time.",
          code: "DOUBLE_BOOKED",
        };
      }
      providerId = available;
    }
    const conflict = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.providerId, providerId),
        ne(appointments.status, "cancelled"),
        lt(appointments.startTime, endTime),
        gt(appointments.endTime, startTime),
      ),
    });
    if (conflict) {
      return {
        success: false,
        error:
          "This dentist is already booked at that time. Please choose a different time.",
        code: "DOUBLE_BOOKED",
      };
    }
    const [appointment] = await db
      .insert(appointments)
      .values({
        locationId: data.locationId,
        patientId: data.patientId,
        providerId,
        status: "confirmed",
        treatmentId: data.treatmentId,
        startTime,
        endTime,
        notes: data.notes || null,
        source: "staff",
      })
      .returning();
    return { success: true, appointmentId: appointment.id };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong booking the appointment.",
      code: "SERVER_ERROR",
    };
  }
}
