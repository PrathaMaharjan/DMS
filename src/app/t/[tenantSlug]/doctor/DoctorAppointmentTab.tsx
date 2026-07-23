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
  Phone,
  ChevronLeft,
  ChevronRight,
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
}

export default function DoctorAppointmentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<
    "today" | "upcoming" | "checked-in" | "completed" | "all"
  >("today");

 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
    },
  ]);

  const handleMarkAttendance = (
    id: string,
    attendance: "Checked In" | "No Show" | "Pending"
  ) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, attendance } : item))
    );
  };

  const handleCompleteAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Completed",
              attendance: "Checked In",
            }
          : item
      )
    );
  };

  const handleUndoCompletion = (id: string) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Confirmed",
            }
          : item
      )
    );
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-800">
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
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

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
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

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
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

        <div className="rounded-xl border border-slate-200/80 bg-white p-4">
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

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, phone, service, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search input change
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#7da3b3] focus:bg-white transition-all"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs">
          {(["today", "upcoming", "checked-in", "completed", "all"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => {
                  setFilterPeriod(tab);
                  setCurrentPage(1); // Reset page when filter tab changes
                }}
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
      <div className="w-full overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                <th className="p-4 pl-6">Patient Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Service</th>
                <th className="p-4">Date</th>
                <th className="p-4">Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
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
                paginatedAppointments.map((item) => (
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

                    {/* Attendance Column */}
                    <td className="p-4 text-center whitespace-nowrap">
                      {item.status !== "Completed" ? (
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
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.65rem] font-bold ${
                            item.attendance === "Checked In"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.attendance}
                        </span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="p-4 pr-6 text-center whitespace-nowrap">
                      {item.status !== "Completed" ? (
                        item.attendance === "Checked In" ? (
                          <button
                            onClick={() => handleCompleteAppointment(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#7da3b3] px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">
                            Check in first
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => handleUndoCompletion(item.id)}
                          title="Click to undo completion"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs">
          <span className="text-[0.7rem] text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredAppointments.length > 0 ? startIndex + 1 : 0}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(startIndex + itemsPerPage, filteredAppointments.length)}
            </strong>{" "}
            of <strong className="text-slate-800">{filteredAppointments.length}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                  currentPage === pageNum
                    ? "bg-[#7da3b3] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}