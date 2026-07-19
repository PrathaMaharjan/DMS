import { eq, and, ne, lt, gt, or } from "drizzle-orm";
import { db } from "@/db";
import { patients, appointments, appointmentTypes } from "@/db/schema";
import { requireSession } from "@/lib/auth/get-session";
import { bookAppointmentSchema } from "@/lib/validators/auth";

export type BookAppointmentResult =
  | {
      success: true;
      appointmentId: string;
      patientId: string;
      wasNewPatient: boolean;
    }
  | { success: false; error: string };

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
      };
    }
    const data = parsed.data;
    const identifierMatch =
      data.email && data.email.trim() !== ""
        ? or(eq(patients.phone, data.phone), eq(patients.email, data.email))
        : eq(patients.phone, data.phone);

    const [existingPatient, serviceType] = await Promise.all([
      db.query.patients.findFirst({
        where: and(eq(patients.orgId, session.orgId), identifierMatch),
      }),
      db.query.appointmentTypes.findFirst({
        where: eq(appointmentTypes.id, data.appointmentTypeId),
      }),
    ]);
    if (!serviceType) {
      return { success: false, error: "Selected service could not be found." };
    }

    const startTime = new Date(
      `${data.preferredDate}T${data.preferredTime}:00`,
    );
    const endTime = new Date(
      startTime.getTime() + serviceType.durationMinutes * 60_000,
    );
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
          })
          .returning();
        patient = newPatient;
        wasNewPatient = true;
      }
      const conflict = await tx.query.appointments.findFirst({
        where: and(
          eq(appointments.providerId, data.providerId),
          ne(appointments.status, "cancelled"),
          lt(appointments.startTime, endTime),
          gt(appointments.endTime, startTime),
        ),
      });

      if (conflict) {
        throw new Error("DOUBLE_BOOKED");
      }
      const [appointment] = await tx
        .insert(appointments)
        .values({
          locationId: data.locationId,
          patientId: patient.id,
          providerId: data.providerId,
          appointmentTypeId: data.appointmentTypeId,
          startTime,
          endTime,
          notes: data.notes || null,
          source: "staff",
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
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }
    if (err instanceof Error && err.message === "DOUBLE_BOOKED") {
      return {
        success: false,
        error:
          "This dentist is already booked at that time. Please choose a different time.",
      };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong booking the appointment.",
    };
  }
}
