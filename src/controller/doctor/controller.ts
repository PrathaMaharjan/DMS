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
} from "@/lib/validators/doctor";
import { and, desc, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";

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