import { db } from "@/db";
import { organizations, locations, treatments, users, userLocationRoles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import BookingForm from "./BookingForm";

export default async function BookingPage() {
  const tenantSlug = process.env.DEFAULT_TENANT_SLUG;

  // 1. Get Organization (by env variable slug, or fallback to first org in DB)
  let org = tenantSlug
    ? await db.query.organizations.findFirst({
        where: eq(organizations.slug, tenantSlug),
      })
    : await db.query.organizations.findFirst();

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-slate-500">
        No clinic configuration found in database.
      </div>
    );
  }

  // 2. Get Primary Clinic Location
  const location = await db.query.locations.findFirst({
    where: eq(locations.orgId, org.id),
  });

  // 3. Fetch Real Services/Treatments (by locationId)
  const services = location
    ? await db
        .select({
          id: treatments.id,
          name: treatments.name,
        })
        .from(treatments)
        .where(eq(treatments.locationId, location.id))
    : [];

  // 4. Fetch Active Clinical Doctors (by locationId and orgId)
  const doctors = location
    ? await db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .innerJoin(userLocationRoles, eq(userLocationRoles.userId, users.id))
        .where(
          and(
            eq(users.orgId, org.id),
            eq(users.isActive, true),
            eq(userLocationRoles.locationId, location.id),
            eq(userLocationRoles.role, "clinical")
          )
        )
    : [];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <ToothOutline className="absolute -left-16 top-24 h-64 w-64 text-sky-200/60 -rotate-12" />
        <ToothOutline className="absolute -right-20 top-[28rem] h-80 w-80 text-sky-200/50 rotate-12" />
        <ToothbrushOutline className="absolute left-[8%] bottom-16 h-40 w-40 text-sky-200/50 -rotate-6" />
        <SparkleOutline className="absolute right-[12%] top-16 h-10 w-10 text-sky-300/70" />
        <SparkleOutline className="absolute left-[20%] top-[42%] h-6 w-6 text-sky-300/60" />
        <CircleRing className="absolute right-[6%] bottom-[8%] h-56 w-56 text-sky-200/40" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8 lg:pt-40">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-sky-300">
            Book an Appointment
          </p>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Let&apos;s get your smile scheduled
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-slate-600">
            Book your visit at <span className="font-semibold text-slate-900">{org.name}</span>. Pick a service and preferred time, and we&apos;ll confirm your appointment shortly.
          </p>
        </div>

        <BookingForm
          clinicName={org.name}
          locationId={location?.id || ""}
          services={services}
          doctors={doctors}
        />
      </div>
    </section>
  );
}

function ToothOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" fill="none" className={className}>
      <path
        d="M100 10c-28 0-46 18-46 46 0 20 6 34 10 52 5 22 8 46 14 72 4 18 12 30 22 30s16-14 20-32c3-14 4-30 8-30s5 16 8 30c4 18 10 32 20 32s18-12 22-30c6-26 9-50 14-72 4-18 10-32 10-52 0-28-18-46-46-46-14 0-22 8-30 8s-16-8-30-8"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToothbrushOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 100" fill="none" className={className}>
      <rect x="10" y="42" width="120" height="16" rx="8" stroke="currentColor" strokeWidth="5" />
      <path d="M130 50h30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <rect x="160" y="20" width="50" height="60" rx="14" stroke="currentColor" strokeWidth="5" />
      <path d="M172 34v32M186 30v40M200 34v32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function SparkleOutline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <path
        d="M20 2c0 8 6 16 18 18-12 2-18 10-18 18 0-8-6-16-18-18 12-2 18-10 18-18Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}