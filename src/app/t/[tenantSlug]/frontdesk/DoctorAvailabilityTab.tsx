"use client";

import { useMemo, useState } from "react";
import { Clock, Coffee, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";

/* ----------------------------------------------------------------------- */
/*  TYPES                                                                    */
/* ----------------------------------------------------------------------- */

interface Break {
  label: string;
  start: string; // "HH:mm" 24hr
  end: string;   // "HH:mm" 24hr
}

interface DoctorSchedule {
  id: string;
  name: string;
  specialty: string;
  workingHours: { start: string; end: string }; // "HH:mm" 24hr
  breaks: Break[];
  isClosedFullDay?: boolean;
}

// Minimal shape needed from your appointments data.
// Swap this for your real DoctorAppointment type once you add a doctorId field.
interface BookedAppointment {
  doctorId: string;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:mm" 24hr, start time
  durationMinutes: number;
  status: "Confirmed" | "In Progress" | "Completed" | "Cancelled";
}

interface Slot {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
  status: "free" | "booked" | "break";
  label?: string; // patient name or break label, if relevant
}

/* ----------------------------------------------------------------------- */
/*  MOCK DATA — replace with real API data                                  */
/* ----------------------------------------------------------------------- */

const DOCTORS_DATA: DoctorSchedule[] = [
  {
    id: "doc-1",
    name: "Dr. Pratha Maharjan",
    specialty: "General Dentistry",
    workingHours: { start: "08:00", end: "16:00" },
    breaks: [{ label: "Lunch Break", start: "12:00", end: "13:00" }],
  },
  {
    id: "doc-2",
    name: "Dr. Sophan Shrestha",
    specialty: "Orthodontics",
    workingHours: { start: "10:00", end: "18:00" },
    breaks: [{ label: "Midday Break", start: "13:00", end: "14:00" }],
  },
  {
    id: "doc-3",
    name: "Dr. Suprasidhhi Pradhan",
    specialty: "Pediatric Dentistry",
    workingHours: { start: "08:00", end: "16:00" },
    breaks: [],
    isClosedFullDay: true,
  },
  {
    id: "doc-4",
    name: "Dr. Pragun Maskey",
    specialty: "Endodontics",
    workingHours: { start: "12:00", end: "20:00" },
    breaks: [
      { label: "Tea Break", start: "15:00", end: "15:30" },
      { label: "Dinner Break", start: "18:00", end: "18:30" },
    ],
  },
];

// Simulates appointments already on the books today. Wire this up to your
// real appointments state (add a `doctorId` field to DoctorAppointment).
const BOOKED_APPOINTMENTS: BookedAppointment[] = [
  { doctorId: "doc-1", date: "2026-07-21", time: "10:00", durationMinutes: 30, status: "Confirmed" },
  { doctorId: "doc-1", date: "2026-07-21", time: "14:30", durationMinutes: 30, status: "Confirmed" },
  { doctorId: "doc-4", date: "2026-07-21", time: "13:00", durationMinutes: 60, status: "Confirmed" },
  { doctorId: "doc-4", date: "2026-07-21", time: "16:00", durationMinutes: 30, status: "Cancelled" }, // ignored
];

const TODAY_STR = "2026-07-21";
const SLOT_MINUTES = 30;

/* ----------------------------------------------------------------------- */
/*  TIME HELPERS                                                            */
/* ----------------------------------------------------------------------- */

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toDisplayTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/* ----------------------------------------------------------------------- */
/*  SLOT COMPUTATION                                                        */
/* ----------------------------------------------------------------------- */

function computeSlots(
  doctor: DoctorSchedule,
  bookings: BookedAppointment[],
  date: string
): Slot[] {
  if (doctor.isClosedFullDay) return [];

  const dayStart = toMinutes(doctor.workingHours.start);
  const dayEnd = toMinutes(doctor.workingHours.end);

  const activeBookings = bookings.filter(
    (b) => b.doctorId === doctor.id && b.date === date && b.status !== "Cancelled"
  );

  const slots: Slot[] = [];

  for (let start = dayStart; start < dayEnd; start += SLOT_MINUTES) {
    const end = start + SLOT_MINUTES;

    const onBreak = doctor.breaks.find((b) =>
      rangesOverlap(start, end, toMinutes(b.start), toMinutes(b.end))
    );
    if (onBreak) {
      slots.push({ start: toDisplayTime(start), end: toDisplayTime(end), status: "break", label: onBreak.label });
      continue;
    }

    const booking = activeBookings.find((b) =>
      rangesOverlap(start, end, toMinutes(b.time), toMinutes(b.time) + b.durationMinutes)
    );
    if (booking) {
      slots.push({ start: toDisplayTime(start), end: toDisplayTime(end), status: "booked" });
      continue;
    }

    slots.push({ start: toDisplayTime(start), end: toDisplayTime(end), status: "free" });
  }

  return slots;
}

function currentStatus(slots: Slot[]): "Available" | "On Break" | "Full Day Off" | "Fully Booked" {
  if (slots.length === 0) return "Full Day Off";
  const freeCount = slots.filter((s) => s.status === "free").length;
  if (freeCount === 0) return "Fully Booked";
  return "Available";
}

/* ----------------------------------------------------------------------- */
/*  COMPONENT                                                               */
/* ----------------------------------------------------------------------- */

export default function DoctorAvailabilityTab() {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedDocId((prev) => (prev === id ? null : id));
  };

  const doctorsWithSlots = useMemo(
    () =>
      DOCTORS_DATA.map((doc) => {
        const slots = computeSlots(doc, BOOKED_APPOINTMENTS, TODAY_STR);
        const freeSlots = slots.filter((s) => s.status === "free");
        return { doc, slots, freeSlots, status: currentStatus(slots) };
      }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-[#7da3b3]/20 bg-[#f4fafc] p-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#7da3b3]" />
          <span>Real-time free/busy slots, computed from working hours, breaks, and booked appointments.</span>
        </div>
        <div className="flex items-center gap-4 text-[0.7rem] font-semibold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Free
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Break
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Off / Full
          </span>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {doctorsWithSlots.map(({ doc, slots, freeSlots, status }) => {
          const isExpanded = expandedDocId === doc.id;

          return (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-[#7da3b3]/30"
            >
              <div>
                {/* Top Row: Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-slate-400">{doc.specialty}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      status === "Full Day Off" || status === "Fully Booked"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Hours & Free Slot Count */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {doc.isClosedFullDay
                      ? "Not Available Today"
                      : `${doc.workingHours.start} - ${doc.workingHours.end}`}
                  </div>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      freeSlots.length > 0
                        ? "text-[#6b92a2] bg-[#7da3b3]/15"
                        : "text-slate-400 bg-slate-100"
                    }`}
                  >
                    {freeSlots.length} open {freeSlots.length === 1 ? "slot" : "slots"}
                  </span>
                </div>

                {/* Timeline Visual Indicator — proportional to real slot data */}
                {!doc.isClosedFullDay && slots.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[0.65rem] font-bold text-slate-400">
                      <span>{doc.workingHours.start}</span>
                      <span>Shift Timeline</span>
                      <span>{doc.workingHours.end}</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      {slots.map((slot, i) => (
                        <div
                          key={i}
                          className={`h-full ${
                            slot.status === "free"
                              ? "bg-emerald-400"
                              : slot.status === "booked"
                              ? "bg-sky-400"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${100 / slots.length}%` }}
                          title={`${slot.start} - ${slot.end}: ${slot.status}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Toggle for Slot Details */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(doc.id)}
                  className="flex w-full items-center justify-between text-xs font-semibold text-[#7da3b3] hover:text-[#6b92a2] transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5" />
                    View Full Schedule
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {/* Expanded Slot List */}
                {isExpanded && (
                  <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto rounded-xl bg-[#f4fafc] p-3 text-xs border border-[#7da3b3]/20">
                    {doc.isClosedFullDay ? (
                      <p className="text-slate-500 italic">Doctor has scheduled a full day off.</p>
                    ) : (
                      slots.map((slot, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            slot.status === "free"
                              ? "bg-white border-emerald-200"
                              : slot.status === "booked"
                              ? "bg-white border-sky-200"
                              : "bg-white border-amber-200"
                          }`}
                        >
                          <span className="font-medium text-slate-800">
                            {slot.start} - {slot.end}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                              slot.status === "free"
                                ? "text-emerald-700 bg-emerald-50"
                                : slot.status === "booked"
                                ? "text-sky-700 bg-sky-50"
                                : "text-amber-700 bg-amber-50"
                            }`}
                          >
                            {slot.status === "free" && <CheckCircle2 className="h-3 w-3" />}
                            {slot.status === "booked" && <XCircle className="h-3 w-3" />}
                            {slot.status === "break" && <Coffee className="h-3 w-3" />}
                            {slot.status === "free"
                              ? "Free"
                              : slot.status === "booked"
                              ? "Booked"
                              : slot.label || "Break"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}