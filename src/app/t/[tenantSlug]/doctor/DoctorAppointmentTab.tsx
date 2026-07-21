"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Stethoscope,
  ChevronRight,
} from "lucide-react";

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  attendance: "Pending" | "Checked In" | "No Show";
  notes?: string;
}

export default function DoctorAppointmentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"today" | "upcoming" | "all">("today");

  // Mock data for the doctor's assigned appointments
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([
    {
      id: "APT-101",
      patientName: "Aarav Sharma",
      patientPhone: "9841000000",
      service: "Dental Checkup & Cleaning",
      date: "2026-07-21",
      time: "10:00 AM",
      status: "Confirmed",
      attendance: "Checked In",
      notes: "Patient reported mild sensitivity on lower right molar.",
    },
    {
      id: "APT-102",
      patientName: "Sita Adhikari",
      patientPhone: "9851012345",
      service: "Root Canal Treatment",
      date: "2026-07-21",
      time: "11:30 AM",
      status: "Confirmed",
      attendance: "Pending",
    },
    {
      id: "APT-103",
      patientName: "Rohan श्रेष्ठ",
      patientPhone: "9801234567",
      service: "Teeth Whitening",
      date: "2026-07-21",
      time: "02:00 PM",
      status: "Confirmed",
      attendance: "Pending",
    },
    {
      id: "APT-104",
      patientName: "Maya Gurung",
      patientPhone: "9812345678",
      service: "Cavity Filling",
      date: "2026-07-22",
      time: "09:30 AM",
      status: "Confirmed",
      attendance: "Pending",
    },
  ]);

  const todayStr = "2026-07-21";

  // Quick Action Handlers
  const handleMarkAttendance = (id: string, attendance: "Checked In" | "No Show") => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, attendance } : item))
    );
  };

  const handleCompleteVisit = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Completed", attendance: "Checked In" } : item
      )
    );
  };

  // Filter Logic
  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPeriod === "today") return appt.date === todayStr;
    if (filterPeriod === "upcoming") return appt.date >= todayStr && appt.status !== "Completed";
    return true;
  });

  return (
    <div className="w-full space-y-5">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-900/5 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, service, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#7da3b3] focus:bg-white transition-all"
          />
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 border border-slate-200/60 text-xs">
          <button
            onClick={() => setFilterPeriod("today")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              filterPeriod === "today"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Today ({appointments.filter((a) => a.date === todayStr).length})
          </button>
          <button
            onClick={() => setFilterPeriod("upcoming")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              filterPeriod === "upcoming"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilterPeriod("all")}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
              filterPeriod === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Appointments List View */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <Stethoscope className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">
            No scheduled visits match your current search or date filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((item) => (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 ${
                item.status === "Completed" ? "opacity-75 bg-slate-50/50" : ""
              }`}
            >
              {/* Left Accent Stripe based on Status */}
              <span
                className={`absolute left-0 top-0 h-full w-1.5 ${
                  item.status === "Completed"
                    ? "bg-emerald-500"
                    : item.attendance === "Checked In"
                    ? "bg-[#7da3b3]"
                    : "bg-amber-400"
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Patient Info & Service */}
                <div className="flex items-start gap-3.5 min-w-[240px] flex-1">
                  <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-[#7da3b3] shrink-0 mt-0.5 border border-sky-100">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900">{item.patientName}</p>
                      <span className="text-[0.65rem] font-medium text-slate-400">
                        {item.patientPhone}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-[#7da3b3]" />
                      {item.service}
                    </p>

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded-md border border-slate-100 mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Time & Date */}
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <div className="space-y-1 text-right">
                    <p className="flex items-center justify-end gap-1.5 font-semibold text-slate-800">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {item.time}
                    </p>
                    <p className="flex items-center justify-end gap-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {item.date}
                    </p>
                  </div>
                </div>

                {/* Attendance & Status Badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                      item.attendance === "Checked In"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.attendance === "No Show"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.attendance}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                      item.status === "Completed"
                        ? "bg-slate-100 text-slate-600 border border-slate-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-l border-slate-100 pl-4">
                  {item.status !== "Completed" ? (
                    <>
                      {item.attendance === "Pending" && (
                        <button
                          onClick={() => handleMarkAttendance(item.id, "Checked In")}
                          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Check In
                        </button>
                      )}

                      <button
                        onClick={() => handleCompleteVisit(item.id)}
                        className="flex items-center gap-1 rounded-full bg-[#7da3b3] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete Visit
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1 py-1 px-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}