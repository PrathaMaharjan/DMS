import { db } from "@/db";
import {
  appointments,
  patients,
  providerSchedules,
  treatments,
  userLocationRoles,
  users,
} from "@/db/schema";
import { requireSession, SessionError } from "@/lib/auth/get-session";
import { and, desc, eq, gte, lte, ne, sql } from "drizzle-orm";

export type AdminDashboardErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "SERVER_ERROR";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// ---------- Stat cards: Total Patients, Appointments Today, Active Doctors, Pending Requests ----------

export type AdminStatsResult =
  | {
      success: true;
      stats: {
        totalPatients: number;
        appointmentsToday: number;
        activeDoctors: number;
        pendingRequests: number;
      };
    }
  | { success: false; error: string; code: AdminDashboardErrorCode };

export async function getAdminDashboardStats(
  locationId: string,
): Promise<AdminStatsResult> {
  try {
    const session = await requireSession();
    const now = new Date();
    // Scoped to ONE specific outlet, not the whole org - same locationId
    // pattern as the front-desk and doctor dashboards, not a third style.
    const [
      totalPatientsResult,
      appointmentsTodayResult,
      activeDoctorsResult,
      pendingResult,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })

        .from(patients)
        .where(
          and(
            eq(patients.orgId, session.orgId),
            eq(patients.locationId, locationId),
            sql`${patients.deletedAt} is null`,
          ),
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)
        .where(
          and(
            eq(appointments.locationId, locationId),
            gte(appointments.startTime, startOfDay(now)),
            lte(appointments.startTime, endOfDay(now)),
            sql`${appointments.status} != 'cancelled'`,
          ),
        ),
      db
        .select({ count: sql<number>`count(distinct ${users.id})::int` })
        .from(users)
        .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
        .where(
          and(
            eq(users.orgId, session.orgId),
            eq(userLocationRoles.locationId, locationId),
            eq(userLocationRoles.role, "clinical"),
            eq(users.isActive, true),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(appointments)

        .where(
          and(
            eq(appointments.locationId, locationId),
            eq(appointments.status, "requested"),
          ),
        ),
    ]);
    return {
      success: true,
      stats: {
        totalPatients: totalPatientsResult[0]?.count ?? 0,
        appointmentsToday: appointmentsTodayResult[0]?.count ?? 0,
        activeDoctors: activeDoctorsResult[0]?.count ?? 0,
        pendingRequests: pendingResult[0]?.count ?? 0,
      },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading dashboard stats.",
      code: "SERVER_ERROR",
    };
  }
}

// treatment popularity

export type TreatmentPopularityResult =
  | { success: true; breakdown: { treatmentName: string; count: number }[] }
  | { success: false; error: string; code: AdminDashboardErrorCode };

export async function getTreatmentPopularity(
  locationId: string,
): Promise<TreatmentPopularityResult> {
  try {
    await requireSession();

    const rows = await db
      .select({
        treatmentName: treatments.name,
        count: sql<number>`count(*)::int`,
      })
      .from(appointments)
      .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(
        and(
          eq(appointments.locationId, locationId),
          sql`${appointments.status} != 'cancelled'`,
        ),
      )
      .groupBy(treatments.name)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    return { success: true, breakdown: rows };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading treatment popularity.",
      code: "SERVER_ERROR",
    };
  }
}

// ---------- New Patient Registrations Trend ----------

// src/lib/controllers/admin-dashboard.controller.ts
export type TrendRange = "7d" | "14d" | "1m" | "1y";

export type PatientTrendResult =
  | { success: true; trend: { label: string; count: number }[] }
  | { success: false; error: string; code: AdminDashboardErrorCode };

export async function getNewPatientTrend(
  locationId: string,
  range: TrendRange,
): Promise<PatientTrendResult> {
  try {
    const session = await requireSession();
    const now = new Date();

    // Each range needs a genuinely different bucket shape, not just a
    // different day-count with the same daily granularity: 7d/14d stay
    // daily, 1m buckets into 4 weeks, 1y buckets into 12 calendar months.
    if (range === "7d" || range === "14d") {
      return await getDailyTrend(
        session.orgId,
        locationId,
        range === "7d" ? 7 : 14,
        now,
      );
    } else if (range === "1m") {
      return await getWeeklyTrend(session.orgId, locationId, now);
    } else {
      return await getMonthlyTrend(session.orgId, locationId, now);
    }
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading the patient trend.",
      code: "SERVER_ERROR",
    };
  }
}

// ---------- 7 Days / 14 Days - one point per calendar day ----------

async function getDailyTrend(
  orgId: string,
  locationId: string,
  days: number,
  now: Date,
): Promise<PatientTrendResult> {
  const scaffold: { label: string; date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    scaffold.push({
      // Day 1, Day 2, ... Day N - counting position within the range,
      // not the actual weekday name. Day 1 is always the oldest day in
      // the window, Day N (7 or 14) is always today.
      label: `Day ${days - i}`,
      date: d.toISOString().slice(0, 10),
      count: 0,
    });
  }

  const rangeStart = startOfDay(new Date(scaffold[0].date));
  const rows = await db
    .select({
      date: sql<string>`to_char(${patients.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, orgId),
        eq(patients.locationId, locationId),
        gte(patients.createdAt, rangeStart),
        lte(patients.createdAt, endOfDay(now)),
      ),
    )
    .groupBy(sql`to_char(${patients.createdAt}, 'YYYY-MM-DD')`);

  const countsByDate = new Map(rows.map((r) => [r.date, r.count]));
  const trend = scaffold.map((d) => ({
    label: d.label,
    count: countsByDate.get(d.date) ?? 0,
  }));

  return { success: true, trend };
}

// ---------- 1 Month - one point per week: W1, W2, W3, W4 ----------

async function getWeeklyTrend(
  orgId: string,
  locationId: string,
  now: Date,
): Promise<PatientTrendResult> {
  // 4 real week-long buckets, most recent 28 days, oldest first (W1)
  // through newest (W4) - matching the screenshot's left-to-right order.
  const weekStarts: Date[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = startOfDay(new Date(now));
    d.setDate(d.getDate() - i * 7 - 6);
    weekStarts.push(d);
  }

  const rangeStart = weekStarts[0];
  const rows = await db
    .select({ createdAt: patients.createdAt })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, orgId),
        eq(patients.locationId, locationId),
        gte(patients.createdAt, rangeStart),
        lte(patients.createdAt, endOfDay(now)),
      ),
    );

  // Bucketing happens in application code here, not SQL - simpler to get
  // right than a 4-way date-range CASE statement, and this table is small
  // enough per-location that it's not a real performance concern.
  const counts = [0, 0, 0, 0];
  for (const row of rows) {
    const created = row.createdAt;
    for (let i = 3; i >= 0; i--) {
      const weekStart = weekStarts[i];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      if (created >= weekStart && created < weekEnd) {
        counts[i]++;
        break;
      }
    }
  }

  const trend = counts.map((count, i) => ({ label: `W${i + 1}`, count }));
  return { success: true, trend };
}

// ---------- 1 Year - one point per calendar month: Jan..Dec ----------

async function getMonthlyTrend(
  orgId: string,
  locationId: string,
  now: Date,
): Promise<PatientTrendResult> {
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const rows = await db
    .select({
      month: sql<string>`to_char(${patients.createdAt}, 'Mon')`,
      monthNum: sql<number>`extract(month from ${patients.createdAt})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(patients)
    .where(
      and(
        eq(patients.orgId, orgId),
        eq(patients.locationId, locationId),
        gte(patients.createdAt, yearStart),
        lte(patients.createdAt, endOfDay(now)),
      ),
    )
    .groupBy(
      sql`to_char(${patients.createdAt}, 'Mon')`,
      sql`extract(month from ${patients.createdAt})`,
    );

  // Full 12-month scaffold, Jan through Dec, so a month with zero real
  // registrations still shows a real 0 rather than a gap in the chart.
  const countsByMonth = new Map(rows.map((r) => [r.monthNum, r.count]));
  const trend = Array.from({ length: 12 }, (_, i) => {
    const label = new Date(2000, i, 1).toLocaleDateString("en-US", {
      month: "short",
    });
    return { label, count: countsByMonth.get(i + 1) ?? 0 };
  });

  return { success: true, trend };
}

// doctor-utilization
export type DoctorUtilizationResult =
  | {
      success: true;
      doctors: {
        doctorId: string;
        name: string;
        bookedSlots: number;
        openSlots: number;
        percentBooked: number;
      }[];
    }
  | { success: false; error: string; code: AdminDashboardErrorCode };

// "Doctor Utilization & Open Slots" - reuses the exact same shift-to-slots
// math as findAvailableDoctor/getDoctorScheduleStatus earlier: shift
// length in minutes / 30 = total slots, minus how many are actually
// booked today.

export async function getDoctorUtilization(
  locationId: string,
): Promise<DoctorUtilizationResult> {
  try {
    const session = await requireSession();
    const now = new Date();
    const dayOfWeek = now.getDay();

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
        ),
      );
    const doctorIds = doctorRows.map((d) => d.id);
    const bookedRows = doctorIds.length
      ? await db
          .select({
            providerId: appointments.providerId,
            count: sql<number>`count(*)::int`,
          })
          .from(appointments)
          .where(
            and(
              eq(appointments.locationId, locationId),
              gte(appointments.startTime, startOfDay(now)),
              lte(appointments.startTime, endOfDay(now)),
              ne(appointments.status, "cancelled"),
            ),
          )
          .groupBy(appointments.providerId)
      : [];
    const bookedByDoctor = new Map(
      bookedRows.map((b) => [b.providerId, b.count]),
    );

    const doctors = doctorRows.map((d) => {
      const booked = bookedByDoctor.get(d.id) ?? 0;

      if (!d.startTime || !d.endTime) {
        return {
          doctorId: d.id,
          name: d.name,
          bookedSlots: booked,
          openSlots: 0,
          percentBooked: booked > 0 ? 100 : 0,
        };
      }

      const [startH, startM] = d.startTime.split(":").map(Number);
      const [endH, endM] = d.endTime.split(":").map(Number);
      const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
      const totalSlots = Math.max(Math.floor(totalMinutes / 30), 1);
      const openSlots = Math.max(totalSlots - booked, 0);
      const percentBooked = Math.round(
        (Math.min(booked, totalSlots) / totalSlots) * 100,
      );

      return {
        doctorId: d.id,
        name: d.name,
        bookedSlots: booked,
        openSlots,
        percentBooked,
      };
    });

    return { success: true, doctors };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return {
      success: false,
      error: "Something went wrong loading doctor utilization.",
      code: "SERVER_ERROR",
    };
  }
}

// today appoment -----------------------

export type TodaysAppointmentsResult =
  | {
      success: true;
      appointments: {
        id: string;
        patientName: string;
        doctorName: string;
        treatmentName: string;
        startTime: string;
        status: string;
      }[];
    }
  | { success: false; error: string; code: AdminDashboardErrorCode };

  export async function getTodaysAppointmentsAcrossDoctors(locationId: string): Promise<TodaysAppointmentsResult> {
  try {
    await requireSession();
    const now = new Date();

    const rows = await db
      .select({
        id: appointments.id,
        patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
        doctorName: users.name,
        treatmentName: treatments.name,
        startTime: appointments.startTime,
        status: appointments.status,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(users, eq(appointments.providerId, users.id))
      .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
      .where(
        and(
          eq(appointments.locationId, locationId),
          gte(appointments.startTime, startOfDay(now)),
          lte(appointments.startTime, endOfDay(now))
        )
      )
      .orderBy(appointments.startTime);
          return {
      success: true,
      appointments: rows.map((r) => ({ ...r, startTime: r.startTime.toTimeString().slice(0, 5) })),
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading today's appointments.", code: "SERVER_ERROR" };
  }
}



export type ActivityFeedErrorCode = "UNAUTHORIZED" | "SERVER_ERROR";

export type ActivityItem = {
  type: "appointment_booked" | "patient_registered" | "treatment_added" | "schedule_updated";
  title: string;
  description: string;
  timestamp: Date;
};

export type ActivityFeedResult =
  | { success: true; activities: ActivityItem[] }
  | { success: false; error: string; code: ActivityFeedErrorCode };

// Derived from existing createdAt timestamps across 4 tables - NOT a
// real activity log. Genuinely can't reconstruct "Appointment Cancelled"
// this way, since nothing records WHEN a status changed, only what it
// currently is. A true activity feed needs a dedicated audit table that
// every action writes to - this is a working approximation until then.
export async function getRecentActivityFeed(locationId: string, limit: number = 10): Promise<ActivityFeedResult> {
  try {
    const session = await requireSession();

    const [recentAppointments, recentPatients, recentTreatments, recentSchedules] = await Promise.all([
      db
        .select({
          patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
          doctorName: users.name,
          treatmentName: treatments.name,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(patients, eq(appointments.patientId, patients.id))
        .innerJoin(users, eq(appointments.providerId, users.id))
        .innerJoin(treatments, eq(appointments.treatmentId, treatments.id))
        .where(eq(appointments.locationId, locationId))
        .orderBy(desc(appointments.createdAt))
        .limit(limit),
      db
        .select({
          patientName: sql<string>`${patients.firstName} || ' ' || ${patients.lastName}`,
          createdAt: patients.createdAt,
        })
        .from(patients)
        .where(eq(patients.locationId, locationId))
        .orderBy(desc(patients.createdAt))
        .limit(limit),
      db
        .select({ name: treatments.name, createdAt: treatments.createdAt })
        .from(treatments)
        .where(eq(treatments.locationId, locationId))
        .orderBy(desc(treatments.createdAt))
        .limit(limit),
      db
        .select({ doctorName: users.name, createdAt: providerSchedules.createdAt })
        .from(providerSchedules)
        .innerJoin(users, eq(providerSchedules.userId, users.id))
        .where(eq(providerSchedules.locationId, locationId))
        .orderBy(desc(providerSchedules.createdAt))
        .limit(limit),
    ]);

    const activities: ActivityItem[] = [
      ...recentAppointments.map((a) => ({
        type: "appointment_booked" as const,
        title: "New Appointment Booked",
        description: `Patient ${a.patientName} booked for ${a.treatmentName} with ${a.doctorName}`,
        timestamp: a.createdAt,
      })),
      ...recentPatients.map((p) => ({
        type: "patient_registered" as const,
        title: "New Patient Registered",
        description: `${p.patientName} created a new profile`,
        timestamp: p.createdAt,
      })),
      ...recentTreatments.map((t) => ({
        type: "treatment_added" as const,
        title: "Treatment Added",
        description: `New service added: ${t.name}`,
        timestamp: t.createdAt,
      })),
      ...recentSchedules.map((s) => ({
        type: "schedule_updated" as const,
        title: "Doctor Working Hours Updated",
        description: `${s.doctorName} updated their working hours`,
        timestamp: s.createdAt,
      })),
    ];

    // Merge all four sources by real timestamp, most recent first -
    // this is the step that actually makes it one unified feed instead
    // of four separate lists.
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return { success: true, activities: activities.slice(0, limit) };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message, code: "UNAUTHORIZED" };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading the activity feed.", code: "SERVER_ERROR" };
  }
}




// getAll
export type AdminDoctorPanelResult =
  | {
      success: true;
      panel: {
        doctorUtilization: {
          doctorId: string;
          name: string;
          bookedSlots: number;
          openSlots: number;
          percentBooked: number;
        }[];
        todaysAppointments: {
          id: string;
          patientName: string;
          doctorName: string;
          treatmentName: string;
          startTime: string;
          status: string;
        }[];
        activityFeed: {
          type: string;
          title: string;
          description: string;
          timestamp: Date;
        }[];
      };
    }
  | { success: false; error: string };

// Everything on this specific screen (Doctor Utilization, Today's
// Appointments Across Doctors, Recent Activity Feed) in one call - three
// genuinely independent panels, run concurrently rather than as three
// separate frontend requests.
export async function getAllAdminDoctorPanel(locationId: string): Promise<AdminDoctorPanelResult> {
  try {
    await requireSession(); // fail fast, once, before running three queries for nothing

    const [utilizationResult, appointmentsResult, activityResult] = await Promise.all([
      getDoctorUtilization(locationId),
      getTodaysAppointmentsAcrossDoctors(locationId),
      getRecentActivityFeed(locationId, 10),
    ]);

    const failures = [utilizationResult, appointmentsResult, activityResult];
    const firstFailure = failures.find((r) => !r.success);
    if (firstFailure && !firstFailure.success) {
      return { success: false, error: firstFailure.error };
    }

    return {
      success: true,
      panel: {
        doctorUtilization: (utilizationResult as Extract<typeof utilizationResult, { success: true }>).doctors,
        todaysAppointments: (appointmentsResult as Extract<typeof appointmentsResult, { success: true }>).appointments,
        activityFeed: (activityResult as Extract<typeof activityResult, { success: true }>).activities,
      },
    };
  } catch (err) {
    if (err instanceof SessionError) {
      return { success: false, error: err.message };
    }
    console.error(err);
    return { success: false, error: "Something went wrong loading the dashboard panel." };
  }
}





