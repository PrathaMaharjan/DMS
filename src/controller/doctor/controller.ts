import { db } from "@/db";
import {
  appointments,
  appointmentTypes,
  locations,
  organizations,
  patients,
  providerProfiles,
  providerSchedules,
  treatments,
  userLocationRoles,
  users,
} from "@/db/schema";
import { requireSession, SessionError } from "@/lib/auth/get-session";
import { hashPassword } from "@/lib/auth/hash";
import { imagePresets } from "@/lib/cloudinary/storage";
import { sendStaffWelcomeEmail } from "@/lib/email/sendWelComeMail";
import {
  createDoctorSchema,
  updateDoctorSchema,
  UpdateScheduleInput,
  updateScheduleSchema,
} from "@/lib/validators/doctor";
import {
  and,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  lt,
  lte,
  ne,
  sql,
} from "drizzle-orm";

export type DoctorErrorCode =
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

// Confirms a user is both (a) a real clinical staff member and (b) belongs
// to the caller's own org - the same two-part check used for Treatments.
async function findOwnedDoctor(doctorId: string, orgId: string) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
    .where(
      and(
        eq(users.id, doctorId),
        eq(users.orgId, orgId),
        eq(userLocationRoles.role, "clinical"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export type CreateDoctorResult =
  | {
      success: true;
      doctor: {
        id: string;
        name: string;
        email: string;
        photoUrl: string | null;
      };
      emailSent: boolean;
    }
  | { success: false; error: string; code: DoctorErrorCode };

export async function createDoctor(
  input: unknown,
): Promise<CreateDoctorResult> {
  try {
    const session = await requireSession();

    const parsed = createDoctorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const [location, org] = await Promise.all([
      db.query.locations.findFirst({
        where: and(
          eq(locations.id, data.locationId),
          eq(locations.orgId, session.orgId),
        ),
      }),
      db.query.organizations.findFirst({
        where: eq(organizations.id, session.orgId),
      }),
    ]);

    if (!location) {
      return {
        success: false,
        error: "Location not found.",
        code: "NOT_FOUND",
      };
    }
    if (!org) {
      return {
        success: false,
        error: "Organization not found.",
        code: "NOT_FOUND",
      };
    }

    const passwordHash = await hashPassword(data.password);
    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          orgId: session.orgId,
          email: data.email,
          phone: data.phone,
          passwordHash,
          name: data.name,
          isActive: true,
        })
        .returning();

      await tx.insert(userLocationRoles).values({
        userId: user.id,
        locationId: data.locationId,
        role: "clinical",
      });

      await tx.insert(providerProfiles).values({
        userId: user.id,
        photoUrl: data.photoKey,
        specialization: data.specialization,
        qualification: data.qualification,
        education: data.education,
        bio: data.bio,
        yearsOfExperience: data.yearsOfExperience,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup,
        gender: data.gender,
        address: data.address,
        employmentType: data.employmentType,
      });

      return user;
    });
    let emailSent = true;
    try {
      await sendStaffWelcomeEmail(
        data.email,
        data.name,
        data.password,
        org.name,
        "Clinical",
      );
    } catch (emailErr) {
      console.error(
        "Doctor created, but welcome email failed to send:",
        emailErr,
      );
      emailSent = false;
    }

    return {
      success: true,
      doctor: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        photoUrl: imagePresets.thumbnail(data.photoKey ?? null),
      },
      emailSent,
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    if (getPgErrorCode(err) === "23505") {
      const constraint =
        (err as { cause?: { constraint?: string } })?.cause?.constraint ?? "";
      if (constraint.includes("phone")) {
        return {
          success: false,
          error: "A staff member with this phone number already exists.",
          code: "DUPLICATE",
        };
      }
      return {
        success: false,
        error: "A staff member with this email already exists.",
        code: "DUPLICATE",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong creating the doctor.",
      code: "SERVER_ERROR",
    };
  }
}

// ----------------------------------get doctor ------------------------------------------
export type GetDoctorsResult =
  | {
      success: true;
      doctors: {
        id: string;
        name: string;
        email: string;
        photoUrl: string | null;
        specialization: string | null;
        yearsOfExperience: number | null;
      }[];
      pagination: { total: number; limit: number; offset: number };
    }
  | { success: false; error: string; code: DoctorErrorCode };

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
export async function getDoctors(
  locationId?: string,
  options?: { limit?: number; offset?: number },
): Promise<GetDoctorsResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(options?.offset ?? 0, 0);

    const whereClause = locationId
      ? and(
          eq(userLocationRoles.role, "clinical"),
          eq(userLocationRoles.locationId, locationId),
          eq(users.orgId, session.orgId),
          isNull(users.deletedAt),
        )
      : and(
          eq(userLocationRoles.role, "clinical"),
          eq(users.orgId, session.orgId),
          eq(users.isActive, true),
          isNull(users.deletedAt),
        );
    const [results, countResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          photoUrl: providerProfiles.photoUrl,
          specialization: providerProfiles.specialization,
          yearsOfExperience: providerProfiles.yearsOfExperience,
        })
        .from(users)
        .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
        .leftJoin(providerProfiles, eq(providerProfiles.userId, users.id))
        .where(whereClause)
        .orderBy(users.name)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(distinct ${users.id})::int` })
        .from(users)
        .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
        .where(whereClause),
    ]);
    const total = countResult[0]?.count ?? 0;

    const doctorIds = results.map((d) => d.id);
    const patientCounts = doctorIds.length
      ? await db
          .select({
            providerId: appointments.providerId,
            patientCount: sql<number>`count(distinct ${appointments.patientId})::int`,
          })
          .from(appointments)
          .where(
            and(
              inArray(appointments.providerId, doctorIds),
              eq(appointments.status, "completed"),
            ),
          )
          .groupBy(appointments.providerId)
      : [];
    const countsByDoctor = new Map(
      patientCounts.map((p) => [p.providerId, p.patientCount]),
    );

    const doctors = results.map((d) => ({
      ...d,
      photoUrl: imagePresets.thumbnail(d.photoUrl),
      patientsCheckedUp: countsByDoctor.get(d.id) ?? 0,
    }));

    return { success: true, doctors, pagination: { total, limit, offset } };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading doctors.",
      code: "SERVER_ERROR",
    };
  }
}
// ---------------------------------------- update doctor --------------------------------

export type UpdateDoctorResult =
  | {
      success: true;
      doctor: { id: string };
    }
  | { success: false; error: string; code: DoctorErrorCode };

export async function updateDoctor(
  doctorId: string,
  input: unknown,
): Promise<UpdateDoctorResult> {
  try {
    const session = await requireSession();

    const parsed = updateDoctorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const owned = await findOwnedDoctor(doctorId, session.orgId);
    if (!owned) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }
    const updatedUser = await db.transaction(async (tx) => {
      const userUpdates: Partial<{
        name: string;
        email: string;
        phone: string;
      }> = {};
      if (data.name !== undefined) userUpdates.name = data.name;
      if (data.email !== undefined) userUpdates.email = data.email;
      if (data.phone !== undefined) userUpdates.phone = data.phone;

      let user = owned;
      if (Object.keys(userUpdates).length > 0) {
        const [updated] = await tx
          .update(users)
          .set(userUpdates)
          .where(eq(users.id, doctorId))
          .returning();
        user = updated;
      } else {
        const [existing] = await tx
          .select()
          .from(users)
          .where(eq(users.id, doctorId));
        user = existing;
      }
      const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (data.photoKey !== undefined) profileUpdates.photoUrl = data.photoKey;
      if (data.specialization !== undefined)
        profileUpdates.specialization = data.specialization;
      if (data.qualification !== undefined)
        profileUpdates.qualification = data.qualification;
      if (data.education !== undefined)
        profileUpdates.education = data.education;
      if (data.bio !== undefined) profileUpdates.bio = data.bio;
      if (data.yearsOfExperience !== undefined)
        profileUpdates.yearsOfExperience = data.yearsOfExperience;
      if (data.dateOfBirth !== undefined)
        profileUpdates.dateOfBirth = data.dateOfBirth;
      if (data.bloodGroup !== undefined)
        profileUpdates.bloodGroup = data.bloodGroup;
      if (data.gender !== undefined) profileUpdates.gender = data.gender;
      if (data.address !== undefined) profileUpdates.address = data.address;
      if (data.employmentType !== undefined)
        profileUpdates.employmentType = data.employmentType;

      await tx
        .update(providerProfiles)
        .set(profileUpdates)
        .where(eq(providerProfiles.userId, doctorId));

      return user;
    });
    const [profile] = await db
      .select({ photoUrl: providerProfiles.photoUrl })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, doctorId));

    return {
      success: true,
      doctor: {
        id: updatedUser.id,
      },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    if (getPgErrorCode(err) === "23505") {
      return {
        success: false,
        error: "A staff member with this email already exists.",
        code: "DUPLICATE",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong updating the doctor.",
      code: "SERVER_ERROR",
    };
  }
}
// -------------------------------- delete doctor -----------------------------------------------------------
export type DeleteDoctorResult =
  | { success: true }
  | { success: false; error: string; code: DoctorErrorCode };

export async function deleteDoctor(
  doctorId: string,
): Promise<DeleteDoctorResult> {
  try {
    const session = await requireSession();

    const owned = await findOwnedDoctor(doctorId, session.orgId);
    if (!owned) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }
    // Soft delete - every appointment and clinical note this doctor ever
    // created stays intact and correctly attributed. Nothing is actually
    // removed from the database.
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, doctorId));

    return { success: true };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,

      error: "Something went wrong deleting the doctor.",
      code: "SERVER_ERROR",
    };
  }
}

// -------------------------------------doctor appoment history ----------------------------------------------
export type HistoryErrorCode = "UNAUTHORIZED" | "NOT_FOUND" | "SERVER_ERROR";

export type DoctorAppointmentHistoryResult =
  | {
      success: true;
      appointments: {
        id: string;
        startTime: Date;
        endTime: Date;
        status: string;
        treatmentName: string; // was serviceName
        patientId: string;
        patientName: string;
      }[];
      pagination: { total: number; limit: number; offset: number };
    }
  | { success: false; error: string; code: HistoryErrorCode };

export async function getAppointmentHistoryByDoctor(
  doctorId: string,
  options?: { limit?: number; offset?: number; from?: Date; to?: Date },
): Promise<DoctorAppointmentHistoryResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(options?.offset ?? 0, 0);
    const doctor = await db.query.users.findFirst({
      where: and(eq(users.id, doctorId), eq(users.orgId, session.orgId)),
    });
    if (!doctor) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }

    // Optional date range - lets a caller ask for "this doctor's appointments
    // this week" instead of always pulling their entire history.
    const conditions = [eq(appointments.providerId, doctorId)];
    if (options?.from)
      conditions.push(gte(appointments.startTime, options.from));
    if (options?.to) conditions.push(lte(appointments.startTime, options.to));
    const whereClause = and(...conditions);
    const [results, countResult] = await Promise.all([
      db
        .select({
          id: appointments.id,
          startTime: appointments.startTime,
          endTime: appointments.endTime,
          status: appointments.status,
          treatmentName: treatments.name, // was serviceName: appointmentTypes.name
          patientId: patients.id,
          patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(treatments, eq(appointments.treatmentId, treatments.id)) // was appointmentTypes / appointmentTypeId
        .where(whereClause)
        .orderBy(desc(appointments.startTime))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)
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
      error: "Something went wrong loading the doctor's appointments.",
      code: "SERVER_ERROR",
    };
  }
}

// ------------------------- get Patent History ------------------------------------
export type PatientHistoryByDoctorResult =
  | {
      success: true;
      visits: {
        appointmentId: string;
        startTime: Date;
        status: string;
        treatmentName: string; // was serviceName
        patientId: string;
        patientName: string;
      }[];
      pagination: { total: number; limit: number; offset: number };
    }
  | { success: false; error: string; code: HistoryErrorCode };
export async function getPatientHistoryByDoctor(
  doctorId: string,
  options?: { limit?: number; offset?: number },
): Promise<PatientHistoryByDoctorResult> {
  try {
    const session = await requireSession();

    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const offset = Math.max(options?.offset ?? 0, 0);

    // Same ownership check - confirms the doctor belongs to this org before
    // revealing any of their patient history.
    const doctor = await db.query.users.findFirst({
      where: and(eq(users.id, doctorId), eq(users.orgId, session.orgId)),
    });
    if (!doctor) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }

    const whereClause = eq(appointments.providerId, doctorId);
    const [results, countResult] = await Promise.all([
      db
        .select({
          appointmentId: appointments.id,
          startTime: appointments.startTime,
          status: appointments.status,
          treatmentName: treatments.name, // was serviceName: appointmentTypes.name
          patientId: patients.id,
          patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(treatments, eq(appointments.treatmentId, treatments.id)) // was appointmentTypes / appointmentTypeId
        .where(whereClause)
        .orderBy(desc(appointments.startTime))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      success: true,
      visits: results,
      pagination: { total, limit, offset },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading doctor's patient history.",
      code: "SERVER_ERROR",
    };
  }
}

// --------------------------------getSingle doctor --------------------------------------
export type GetDoctorResult =
  | {
      success: true;
      doctor: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        photoUrl: string | null;
        specialization: string | null;
        qualification: string | null;
        education: string | null;
        bio: string | null;
        yearsOfExperience: number | null;
        schedule: {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
          locationId: string;
        }[];
      };
    }
  | { success: false; error: string; code: DoctorErrorCode };

export async function getDoctor(doctorId: string): Promise<GetDoctorResult> {
  try {
    const session = await requireSession();

    const [record, schedule] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          photoUrl: providerProfiles.photoUrl,
          specialization: providerProfiles.specialization,
          qualification: providerProfiles.qualification,
          education: providerProfiles.education,
          bio: providerProfiles.bio,
          yearsOfExperience: providerProfiles.yearsOfExperience,
        })
        .from(users)
        .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
        .leftJoin(providerProfiles, eq(providerProfiles.userId, users.id))
        .where(
          and(
            eq(users.id, doctorId),
            eq(users.orgId, session.orgId),
            eq(userLocationRoles.role, "clinical"),
            eq(users.isActive, true),
            isNull(users.deletedAt),
          ),
        )
        .limit(1),
      db
        .select({
          dayOfWeek: providerSchedules.dayOfWeek,
          startTime: providerSchedules.startTime,
          endTime: providerSchedules.endTime,
          locationId: providerSchedules.locationId,
        })
        .from(providerSchedules)
        .where(eq(providerSchedules.userId, doctorId))
        .orderBy(providerSchedules.dayOfWeek),
    ]);

    const found = record[0];
    if (!found) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }

    return {
      success: true,
      doctor: {
        ...found,
        photoUrl: imagePresets.full(found.photoUrl),
        schedule,
      },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading the doctor.",
      code: "SERVER_ERROR",
    };
  }
}

// -------------------------------- updateSchedule -----------------------------------------
export type UpdateScheduleResult =
  | { success: true }
  | { success: false; error: string; code: DoctorErrorCode };

// The actual logic - takes an explicit doctorId rather than reading it
// from the session itself, so both callers below can share one
// implementation without duplicating the replace-on-save transaction.
async function replaceSchedule(
  doctorId: string,
  data: UpdateScheduleInput,
): Promise<UpdateScheduleResult> {
  await db.transaction(async (tx) => {
    await tx
      .delete(providerSchedules)
      .where(
        and(
          eq(providerSchedules.userId, doctorId),
          eq(providerSchedules.locationId, data.locationId),
        ),
      );

    if (data.schedule.length > 0) {
      await tx.insert(providerSchedules).values(
        data.schedule.map((day) => ({
          userId: doctorId,
          locationId: data.locationId,
          dayOfWeek: day.dayOfWeek,
          startTime: day.startTime,
          endTime: day.endTime,
        })),
      );
    }
  });

  return { success: true };
}

// Doctor editing their OWN hours - identity comes from session.userId
// only, never from the request. A doctor can never touch anyone else's
// schedule through this function, structurally, not just by convention.
export async function updateMySchedule(
  input: unknown,
): Promise<UpdateScheduleResult> {
  try {
    const session = await requireSession();

    const parsed = updateScheduleSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const assignment = await db.query.userLocationRoles.findFirst({
      where: and(
        eq(userLocationRoles.userId, session.userId),
        eq(userLocationRoles.locationId, data.locationId),
        eq(userLocationRoles.role, "clinical"),
      ),
    });
    if (!assignment) {
      return {
        success: false,
        error: "You are not assigned to this location.",
        code: "NOT_FOUND",
      };
    }

    return await replaceSchedule(session.userId, data);
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong updating your schedule.",
      code: "SERVER_ERROR",
    };
  }
}

// -------------------------- update by owner -----------------------------------
// comes from the URL, but ownership is still verified against session.orgId
// before anything is touched, same tenant-isolation pattern as everything
// else (findOwnedDoctor).
export async function updateDoctorSchedule(
  doctorId: string,
  input: unknown,
): Promise<UpdateScheduleResult> {
  try {
    const session = await requireSession();

    const parsed = updateScheduleSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        code: "VALIDATION",
      };
    }
    const data = parsed.data;

    const owned = await findOwnedDoctor(doctorId, session.orgId);
    if (!owned) {
      return { success: false, error: "Doctor not found.", code: "NOT_FOUND" };
    }

    return await replaceSchedule(doctorId, data);
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong updating the doctor's schedule.",
      code: "SERVER_ERROR",
    };
  }
}

// ------------------ get schedule information ----------------------------------
export type ScheduleStatusResult =
  | {
      success: true;
      doctors: {
        id: string;
        name: string;
        startTime: string | null;
        endTime: string | null;
        status: "available" | "on_leave" | "not_scheduled";
        openSlots: number;
      }[];
    }
  | { success: false; error: string; code: DoctorErrorCode };
export async function getDoctorScheduleStatus(
  locationId: string,
  date: string,
): Promise<ScheduleStatusResult> {
  try {
    const session = await requireSession();
    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

    const doctorRows = await db
      .select({
        id: users.id,
        name: users.name,
        startTime: providerSchedules.startTime,
        endTime: providerSchedules.endTime,
      })
      .from(users)
      .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
      .leftJoin(
        providerSchedules,
        and(
          eq(providerSchedules.userId, users.id),
          eq(providerSchedules.locationId, locationId),
          eq(providerSchedules.dayOfWeek, dayOfWeek),
        ),
      )
      .where(
        and(
          eq(userLocationRoles.locationId, locationId),
          eq(userLocationRoles.role, "clinical"),
          eq(users.orgId, session.orgId),
          eq(users.isActive, true),
          isNull(users.deletedAt),
        ),
      );

    const doctorIds = doctorRows.map((d) => d.id);

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    const bookedRows = doctorIds.length
      ? await db
          .select({
            providerId: appointments.providerId,
            count: sql<number>`count(*)::int`,
          })
          .from(appointments)
          .where(
            and(
              inArray(appointments.providerId, doctorIds),
              ne(appointments.status, "cancelled"),
              gt(appointments.startTime, dayStart),
              lt(appointments.startTime, dayEnd),
            ),
          )
          .groupBy(appointments.providerId)
      : [];
    const bookedByDoctor = new Map(
      bookedRows.map((b) => [b.providerId, b.count]),
    );

    const doctors = doctorRows.map((d) => {
      if (!d.startTime || !d.endTime) {
        // Not scheduled to work this day of the week at all.
        return { ...d, status: "not_scheduled" as const, openSlots: 0 };
      }

      const [startH, startM] = d.startTime.split(":").map(Number);
      const [endH, endM] = d.endTime.split(":").map(Number);
      const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
      const totalSlots = Math.floor(totalMinutes / 30);
      const booked = bookedByDoctor.get(d.id) ?? 0;
      const openSlots = Math.max(totalSlots - booked, 0);

      // Inferred, not recorded: scheduled to work, but zero slots left
      // reads as "on leave" here - genuinely indistinguishable from
      // "fully booked" without a real leave record.
      const status =
        openSlots === 0 ? ("on_leave" as const) : ("available" as const);

      return { ...d, status, openSlots };
    });

    return { success: true, doctors };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading doctor schedules.",
      code: "SERVER_ERROR",
    };
  }
}

// ------------------------- get doctor name and id ---------------------------------------
export type GetDoctorNameAndIdResult =
  | {
      success: true;
      doctors: {
        id: string;
        name: string;
      }[];
    }
  | { success: false; error: string; code: DoctorErrorCode };

export async function getDoctorNameAndId(
  locationId?: string,
): Promise<GetDoctorNameAndIdResult> {
  try {
    const session = await requireSession();
    const whereClause = locationId
      ? and(
          eq(userLocationRoles.role, "clinical"),
          eq(userLocationRoles.locationId, locationId),
          eq(users.orgId, session.orgId),
          isNull(users.deletedAt),
        )
      : and(
          eq(userLocationRoles.role, "clinical"),
          eq(users.orgId, session.orgId),
          eq(users.isActive, true),
          isNull(users.deletedAt),
        );
    const result = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
      .where(whereClause)
      .orderBy(users.name);
    return { success: true, doctors: result };
  } catch (error) {
    if (error instanceof SessionError) {
      return { success: false, error: error.message, code: "UNAUTHORIZED" };
    }
    console.error(error);
    return {
      success: false,
      error: "Something went wrong loading doctor names and ids.",
      code: "SERVER_ERROR",
    };
  }
}
