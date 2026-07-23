"use client";

import { useState } from "react";
import { Clock, Calendar, Coffee, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface DoctorSchedule {
  id: string;
  name: string;
  specialty: string;
  workingHours: { start: string; end: string };
  status: "Available" | "On Break" | "Full Day Off";
  openSlotsCount: number;
  breaks: { label: string; start: string; end: string }[];
  isClosedFullDay?: boolean;
}

const DOCTORS_DATA: DoctorSchedule[] = [
  {
    id: "doc-1",
    name: "Dr. Pratha Maharjan",
    specialty: "General Dentistry",
    workingHours: { start: "08:00", end: "16:00" },
    status: "Available",
    openSlotsCount: 3,
    breaks: [{ label: "Lunch Break", start: "12:00", end: "13:00" }],
  },
  {
    id: "doc-2",
    name: "Dr. Sophan Shrestha",
    specialty: "Orthodontics",
    workingHours: { start: "10:00", end: "18:00" },
    status: "On Break",
    openSlotsCount: 1,
    breaks: [{ label: "Midday Break", start: "13:00", end: "14:00" }],
  },
  {
    id: "doc-3",
    name: "Dr. Suprasidhhi Pradhan",
    specialty: "Pediatric Dentistry",
    workingHours: { start: "08:00", end: "16:00" },
    status: "Full Day Off",
    openSlotsCount: 0,
    breaks: [],
    isClosedFullDay: true,
  },
  {
    id: "doc-4",
    name: "Dr. Pragun Maskey",
    specialty: "Endodontics",
    workingHours: { start: "12:00", end: "20:00" },
    status: "Available",
    openSlotsCount: 5,
    breaks: [
      { label: "Tea Break", start: "15:00", end: "15:30" },
      { label: "Dinner Break", start: "18:00", end: "18:30" },
    ],
  },
];

export default function DoctorAvailabilityTab() {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedDocId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-[#7da3b3]/20 bg-[#f4fafc] p-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#7da3b3]" />
          <span>Showing real-time schedules and overrides for today.</span>
        </div>
        <div className="flex items-center gap-4 text-[0.7rem] font-semibold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> On Break
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Off / Closed
          </span>
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {DOCTORS_DATA.map((doc) => {
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
                    <h3 className="text-base font-bold text-slate-900">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-400">{doc.specialty}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      doc.isClosedFullDay
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : doc.status === "On Break"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                {/* Hours & Slots Pill */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {doc.isClosedFullDay
                      ? "Not Available Today"
                      : `${doc.workingHours.start} - ${doc.workingHours.end}`}
                  </div>
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                      doc.openSlotsCount > 0
                        ? "text-[#6b92a2] bg-[#7da3b3]/15"
                        : "text-slate-400 bg-slate-100"
                    }`}
                  >
                    {doc.openSlotsCount} open {doc.openSlotsCount === 1 ? "slot" : "slots"}
                  </span>
                </div>

                {/* Timeline Visual Indicator */}
                {!doc.isClosedFullDay && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[0.65rem] font-bold text-slate-400">
                      <span>{doc.workingHours.start}</span>
                      <span>Shift Timeline</span>
                      <span>{doc.workingHours.end}</span>
                    </div>
                    {/* Visual bar split into available / break sections */}
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-emerald-400" style={{ width: "40%" }} />
                      {doc.breaks.length > 0 && (
                        <div
                          className="h-full bg-amber-400"
                          style={{ width: "20%" }}
                          title="Break Time"
                        />
                      )}
                      <div className="h-full bg-emerald-400" style={{ width: "40%" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Toggle for Break Details */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleExpand(doc.id)}
                  className="flex w-full items-center justify-between text-xs font-semibold text-[#7da3b3] hover:text-[#6b92a2] transition-colors"
                >
                  <span className="flex items-center gap-1">
                    <Coffee className="h-3.5 w-3.5" />
                    {doc.breaks.length > 0
                      ? `${doc.breaks.length} Scheduled Break(s)`
                      : "No Breaks Configured"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 space-y-2 rounded-xl bg-[#f4fafc] p-3 text-xs border border-[#7da3b3]/20">
                    {doc.isClosedFullDay ? (
                      <p className="text-slate-500 italic">
                        Doctor has scheduled a full day off.
                      </p>
                    ) : doc.breaks.length === 0 ? (
                      <p className="text-slate-500 italic">
                        Continuous working hours with no breaks.
                      </p>
                    ) : (
                      doc.breaks.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60"
                        >
                          <span className="font-medium text-slate-800">{b.label}</span>
                          <span className="font-bold text-[#7da3b3] bg-[#7da3b3]/10 px-2 py-0.5 rounded-md">
                            {b.start} - {b.end}
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