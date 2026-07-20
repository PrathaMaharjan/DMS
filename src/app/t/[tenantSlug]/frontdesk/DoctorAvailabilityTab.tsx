"use client";

import { AlertCircle } from "lucide-react";

const DOCTOR_SCHEDULES = [
  { name: "Pratha Maharjan", hours: "08:00 AM - 04:00 PM", status: "Available", slots: "3 open slots" },
  { name: "Sophan Shrestha", hours: "10:00 AM - 06:00 PM", status: "Available", slots: "1 open slot" },
  { name: "Suprasidhhi Pradhan", hours: "08:00 AM - 04:00 PM", status: "On Leave (Today)", slots: "0 open slots" },
  { name: "Pragun Maskey", hours: "12:00 PM - 08:00 PM", status: "Available", slots: "5 open slots" },
];

export default function DoctorAvailabilityTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50/60 p-3.5 text-xs text-sky-800">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span><strong>Front Desk Privilege:</strong> Read-only allocation matrix. Changes require practitioner configuration override.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {DOCTOR_SCHEDULES.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <div>
              <h3 className="text-base font-medium text-slate-900">{doc.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{doc.hours}</p>
              <span className="mt-2 inline-block text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">{doc.slots}</span>
            </div>
            <div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                doc.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>{doc.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}