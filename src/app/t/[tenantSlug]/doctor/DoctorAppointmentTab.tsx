"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Search,
  CheckCircle2,
  Stethoscope,
  CalendarDays,
  UserCheck,
  X,
  Phone,
 
} from "lucide-react";

export interface DoctorAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  service: string;
  date: string; 
  time: string;
  status: "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  attendance: "Pending" | "Checked In" | "No Show";
  notes?: string;
  prescription?: string;
}

export default function DoctorAppointmentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<
    "today" | "upcoming" | "checked-in" | "completed" | "all"
  >("today");

  const todayStr = "2026-07-21";


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
      patientName: "Rohan Shrestha",
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
    {
      id: "APT-105",
      patientName: "Bikash Thapa",
      patientPhone: "9849988776",
      service: "Scaling & Polishing",
      date: "2026-07-21",
      time: "03:30 PM",
      status: "Completed",
      attendance: "Checked In",
      notes: "Procedure completed without complications.",
    },
  ]);


  const [selectedApptForCompletion, setSelectedApptForCompletion] =
    useState<DoctorAppointment | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [completionPrescription, setCompletionPrescription] = useState("");


  const handleMarkAttendance = (
    id: string,
    attendance: "Checked In" | "No Show" | "Pending"
  ) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, attendance } : item))
    );
  };

  const handleOpenCompletionModal = (appt: DoctorAppointment) => {
    setSelectedApptForCompletion(appt);
    setCompletionNotes(appt.notes || "");
    setCompletionPrescription(appt.prescription || "");
  };

  const handleSaveVisitCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForCompletion) return;

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedApptForCompletion.id
          ? {
              ...item,
              status: "Completed",
              attendance: "Checked In",
              notes: completionNotes || undefined,
              prescription: completionPrescription || undefined,
            }
          : item
      )
    );

    setSelectedApptForCompletion(null);
    setCompletionNotes("");
    setCompletionPrescription("");
  };

 
  const stats = {
    today: appointments.filter((a) => a.date === todayStr).length,
    upcoming: appointments.filter(
      (a) => a.date >= todayStr && a.status !== "Completed"
    ).length,
    checkedIn: appointments.filter(
      (a) => a.attendance === "Checked In" && a.status !== "Completed"
    ).length,
    completed: appointments.filter((a) => a.status === "Completed").length,
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesSearch =
      appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.patientPhone.includes(searchQuery) ||
      appt.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPeriod === "today") return appt.date === todayStr;
    if (filterPeriod === "upcoming")
      return appt.date >= todayStr && appt.status !== "Completed";
    if (filterPeriod === "checked-in")
      return appt.attendance === "Checked In" && appt.status !== "Completed";
    if (filterPeriod === "completed") return appt.status === "Completed";
    return true;
  });

  return (
    <div className="w-full space-y-6 text-slate-800">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div
          onClick={() => setFilterPeriod("today")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filterPeriod === "today"
              ? "border-[#7da3b3] bg-sky-50/50 shadow-sm"
              : "border-slate-200/80 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Today&apos;s Visits
            </span>
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.today}</p>
        </div>

        <div
          onClick={() => setFilterPeriod("upcoming")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filterPeriod === "upcoming"
              ? "border-[#7da3b3] bg-sky-50/50 shadow-sm"
              : "border-slate-200/80 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Upcoming
            </span>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
              <CalendarDays className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.upcoming}
          </p>
        </div>

        <div
          onClick={() => setFilterPeriod("checked-in")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filterPeriod === "checked-in"
              ? "border-[#7da3b3] bg-sky-50/50 shadow-sm"
              : "border-slate-200/80 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Checked-In
            </span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.checkedIn}
          </p>
        </div>

        <div
          onClick={() => setFilterPeriod("completed")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            filterPeriod === "completed"
              ? "border-[#7da3b3] bg-sky-50/50 shadow-sm"
              : "border-slate-200/80 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Completed
            </span>
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.completed}
          </p>
        </div>
      </div>

   
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, phone, service, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#7da3b3] focus:bg-white transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
          {(["today", "upcoming", "checked-in", "completed", "all"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilterPeriod(tab)}
                className={`rounded-md px-3 py-1.5 font-semibold capitalize transition-all ${
                  filterPeriod === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabular Appointments List */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="p-4 pl-6">Patient Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-center">Actions & Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Stethoscope className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      No appointments found
                    </p>
                    <p className="text-[0.75rem] text-slate-400 mt-0.5">
                      Try tweaking your search term or tab filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      item.status === "Completed" ? "bg-slate-50/40" : ""
                    }`}
                  >
               
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-sky-50 flex items-center justify-center text-[#7da3b3] font-bold shrink-0 border border-sky-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">
                            {item.patientName}
                          </p>
                          <span className="text-[0.65rem] font-semibold text-slate-400">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    
                    <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {item.patientPhone}
                      </div>
                    </td>

                   
                    <td className="p-4 text-xs font-medium text-slate-800">
                      <span className="inline-block bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                        {item.service}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {item.date}
                      </div>
                    </td>

                
                    <td className="p-4 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {item.time}
                      </div>
                    </td>

                  
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold ${
                          item.status === "Completed"
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions & Attendance Updates */}
                    <td className="p-4 pr-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {item.status !== "Completed" ? (
                          <>
                            {/* Attendance Select / Update Controls */}
                            <select
                              value={item.attendance}
                              onChange={(e) =>
                                handleMarkAttendance(
                                  item.id,
                                  e.target.value as "Checked In" | "No Show" | "Pending"
                                )
                              }
                              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold outline-none transition-all cursor-pointer ${
                                item.attendance === "Checked In"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : item.attendance === "No Show"
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Checked In">Checked In</option>
                              <option value="No Show">No Show</option>
                            </select>

                            {/* Complete Visit Button */}
                            <button
                              onClick={() => handleOpenCompletionModal(item)}
                              className="flex items-center gap-1 rounded-lg bg-[#7da3b3] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold ${
                                item.attendance === "Checked In"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {item.attendance}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 py-1 px-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Done
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Visit Modal */}
      {selectedApptForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Complete Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApptForCompletion.patientName} •{" "}
                  {selectedApptForCompletion.service}
                </p>
              </div>
              <button
                onClick={() => setSelectedApptForCompletion(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveVisitCompletion}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical Notes / Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Record treatment details or diagnostic notes..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 outline-none focus:border-[#7da3b3] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prescription / Follow-up Advice
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg - 3x daily for 5 days"
                  value={completionPrescription}
                  onChange={(e) => setCompletionPrescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 outline-none focus:border-[#7da3b3] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApptForCompletion(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#7da3b3] px-4 py-2 font-semibold text-white hover:bg-[#6b92a2] shadow-sm"
                >
                  Save & Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}