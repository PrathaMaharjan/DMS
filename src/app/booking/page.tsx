"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

const SERVICES = [
  "Routine Checkup & Cleaning",
  "Teeth Whitening",
  "Root Canal Treatment",
  "Dental Implants",
  "Braces & Aligners",
  "Emergency Care",
];

const DENTISTS = [
  "Pratha Maharjan",
"Sophan Shrestha",
  "Suprasidhhi Pradhan",
  "Pragun Maskey",
];

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICES[0],
    dentist: DENTISTS[0],
    date: "",
    time: "",
    notes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitted(true);
  }

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
    Let's get your smile scheduled
  </h1>

  <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-slate-600">
    Pick a service, tell us a bit about yourself, and we&apos;ll
    confirm your appointment shortly.
  </p>
</div>

        <div className="mt-12">
          {submitted ? (
            <div className="flex flex-col items-center rounded-3xl border border-slate-900/5 bg-white/90 p-10 text-center shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-sm sm:p-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-slate-900">
                Appointment requested
              </h2>
              <p className="mt-2 max-w-sm text-[0.95rem] text-slate-600">
                Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll reach
                out at {form.phone || form.email} to confirm your{" "}
                {form.date ? `${form.date} ` : ""}appointment for{" "}
                {form.service}.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 text-[0.9rem] font-medium text-sky-700 underline-offset-4 hover:underline"
              >
                Book another appointment
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-900/5 bg-white/90 p-8 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-sm sm:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Pratha Maharjan"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                    Phone number
                  </span>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="9XXXXXXXXX"
                    className={inputClass}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="demo@gamil.com"
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                    Service
                  </span>
                  <select
                    value={form.service}
                    onChange={(e) => update("service", e.target.value)}
                    className={inputClass}
                  >
                    {SERVICES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    Preferred dentist
                  </span>
                  <select
                    value={form.dentist}
                    onChange={(e) => update("dentist", e.target.value)}
                    className={inputClass}
                  >
                    {DENTISTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                    Preferred date
                  </span>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                    Preferred time
                  </span>
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(e) => update("time", e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    Notes (optional)
                  </span>
                  <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Anything we should know before your visit?"
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </label>
              </div>

<button
  type="submit"
  className="group relative mt-8 h-12 w-full overflow-hidden rounded-full border border-[#a5c5d1] sm:w-auto"
>

  <div className="inline-flex h-12 w-full items-center justify-center bg-[#7da3b3] px-10 text-[0.95rem] font-medium text-white transition-transform duration-300 group-hover:-translate-y-full">
    Confirm Appointment
  </div>


  <div className="absolute inset-0 inline-flex h-12 w-full translate-y-full items-center justify-center bg-white px-10 text-[0.95rem] font-medium text-slate-900 transition-transform duration-300 group-hover:translate-y-0">
    Confirm Appointment
  </div>
</button>
            </form>
          )}
        </div>
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