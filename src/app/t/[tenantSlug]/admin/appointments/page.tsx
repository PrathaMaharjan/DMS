"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  CalendarClock,
  CalendarCheck2,
  CalendarX2,
  Filter,
  ChevronLeft,
  SquarePen,
  IdCard,
  Clock,
  User,
  Phone,
  Stethoscope,
  Cross,
  Syringe,
  HeartPulse,
  Pill,
  Activity,
  CalendarDays,
  ClipboardList,
  Trash2,
  CheckCircle2,
  XCircle,
  Hourglass,
  BadgeCheck,
} from "lucide-react";

const STATUSES = ["Scheduled", "Confirmed", "Completed", "Cancelled"] as const;
type Status = (typeof STATUSES)[number];

// Kept in sync with the public booking page's SERVICES and DENTISTS lists
const TREATMENT_OPTIONS = [
  "Routine Checkup & Cleaning",
  "Teeth Whitening",
  "Root Canal Treatment",
  "Dental Implants",
  "Braces & Aligners",
  "Emergency Care",
];

const DOCTOR_OPTIONS = [
  "Pratha Maharjan",
  "Sophan Shrestha",
  "Suprasidhhi Pradhan",
  "Pragun Maskey",
];

const STATUS_ICONS: Record<Status, typeof Hourglass> = {
  Scheduled: Hourglass,
  Confirmed: BadgeCheck,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

const STATUS_COLORS: Record<Status, string> = {
  Scheduled: "bg-amber-100 text-amber-700",
  Confirmed: "bg-sky-100 text-sky-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const STATUS_DOT: Record<Status, string> = {
  Scheduled: "bg-amber-400",
  Confirmed: "bg-sky-400",
  Completed: "bg-emerald-400",
  Cancelled: "bg-rose-400",
};

type Appointment = {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  treatment: string;
  doctor: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string;
  status: Status;
  notes?: string;
  createdDate?: string;
};

const TODAY = "2026-07-20";

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    appointmentId: "APT-1001",
    patientName: "Sabina Karki",
    patientPhone: "98410 22314",
    treatment: "Routine Checkup & Cleaning",
    doctor: "Pratha Maharjan",
    date: TODAY,
    time: "09:30",
    duration: "30 mins",
    status: "Confirmed",
    notes: "Routine six-month cleaning. Patient prefers morning slots.",
    createdDate: "2026-07-10 11:20",
  },
  {
    id: "2",
    appointmentId: "APT-1002",
    patientName: "Anish Rai",
    patientPhone: "98023 44121",
    treatment: "Root Canal Treatment",
    doctor: "Sophan Shrestha",
    date: TODAY,
    time: "11:00",
    duration: "60 mins",
    status: "Scheduled",
    notes: "Second sitting for molar root canal. Confirm anaesthesia stock.",
    createdDate: "2026-07-12 09:05",
  },
  {
    id: "3",
    appointmentId: "APT-1003",
    patientName: "Priya Shrestha",
    patientPhone: "98112 90887",
    treatment: "Braces & Aligners",
    doctor: "Suprasidhhi Pradhan",
    date: TODAY,
    time: "14:15",
    duration: "20 mins",
    status: "Scheduled",
    notes: "Tighten upper arch wire. Review elastic wear compliance.",
    createdDate: "2026-07-14 16:40",
  },
  {
    id: "4",
    appointmentId: "APT-1004",
    patientName: "Bikash Adhikari",
    patientPhone: "97701 55890",
    treatment: "Teeth Whitening",
    doctor: "Pragun Maskey",
    date: "2026-07-21",
    time: "10:00",
    duration: "45 mins",
    status: "Confirmed",
    notes: "First whitening session, discuss sensitivity beforehand.",
    createdDate: "2026-07-15 12:00",
  },
  {
    id: "5",
    appointmentId: "APT-1005",
    patientName: "Nisha Tamang",
    patientPhone: "98450 67231",
    treatment: "Routine Checkup & Cleaning",
    doctor: "Pratha Maharjan",
    date: "2026-07-19",
    time: "16:30",
    duration: "25 mins",
    status: "Completed",
    notes: "No cavities found. Recommended fluoride varnish next visit.",
    createdDate: "2026-07-05 08:30",
  },
  {
    id: "6",
    appointmentId: "APT-1006",
    patientName: "Rojina Magar",
    patientPhone: "98603 12980",
    treatment: "Emergency Care",
    doctor: "Sophan Shrestha",
    date: "2026-07-18",
    time: "13:00",
    duration: "40 mins",
    status: "Cancelled",
    notes: "Patient rescheduled due to travel, follow up for new date.",
    createdDate: "2026-07-02 10:15",
  },
  {
    id: "7",
    appointmentId: "APT-1007",
    patientName: "Suresh Poudel",
    patientPhone: "98212 45509",
    treatment: "Dental Implants",
    doctor: "Pragun Maskey",
    date: "2026-07-22",
    time: "09:00",
    duration: "90 mins",
    status: "Scheduled",
    notes: "Pre-implant consultation completed, proceeding with placement.",
    createdDate: "2026-07-16 14:50",
  },
];

const EMPTY_FORM = {
  patientName: "",
  patientPhone: "",
  treatment: TREATMENT_OPTIONS[0],
  doctor: DOCTOR_OPTIONS[0],
  date: TODAY,
  time: "09:00",
  duration: "",
  status: "Scheduled" as Status,
  notes: "",
};

type FormState = typeof EMPTY_FORM;

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

const textareaClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

function appointmentToForm(a: Appointment): FormState {
  return {
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    treatment: a.treatment,
    doctor: a.doctor,
    date: a.date,
    time: a.time,
    duration: a.duration,
    status: a.status,
    notes: a.notes ?? "",
  };
}

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const label = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return dateStr === TODAY ? `Today, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : label;
}

function formatTimeLabel(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

const AVATAR_PALETTE = [
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
];

function avatarColorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[hash];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const LIST_GRID = "grid grid-cols-[2fr_1.3fr_1.6fr_1.1fr_5rem] items-center gap-4";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [dateFilter, setDateFilter] = useState<"All" | "Today" | "Upcoming">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [profileTab, setProfileTab] = useState<"detail" | "notes">("detail");

  function openProfile(a: Appointment) {
    setSelected(a);
    setProfileTab("detail");
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(a: Appointment) {
    setModalMode("edit");
    setEditingId(a.id);
    setForm(appointmentToForm(a));
    setModalOpen(true);
  }

  function requestDelete(a: Appointment) {
    setDeleteTarget(a);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const a = deleteTarget;
    setDeletingId(a.id);
    setAppointments((prev) => prev.filter((x) => x.id !== a.id));
    setSelected((prev) => (prev?.id === a.id ? null : prev));
    setDeletingId(null);
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments
      .filter((a) => {
        const matchesQuery =
          !q ||
          a.patientName.toLowerCase().includes(q) ||
          a.treatment.toLowerCase().includes(q) ||
          a.doctor.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "All" || a.status === statusFilter;
        const matchesDate =
          dateFilter === "All" ||
          (dateFilter === "Today" && a.date === TODAY) ||
          (dateFilter === "Upcoming" && a.date >= TODAY);
        return matchesQuery && matchesStatus && matchesDate;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, query, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const todayCount = appointments.filter((a) => a.date === TODAY).length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
    return [
      {
        icon: CalendarClock,
        label: "Total Appointments",
        value: String(appointments.length),
        trend: "+2 this week",
        trendUp: true,
      },
      {
        icon: CalendarDays,
        label: "Today's Appointments",
        value: String(todayCount),
        trend: "3 confirmed",
        trendUp: true,
      },
      {
        icon: CalendarCheck2,
        label: "Completed",
        value: String(completed),
        trend: "On track",
        trendUp: true,
      },
      {
        icon: CalendarX2,
        label: "Cancelled",
        value: String(cancelled),
        trend: cancelled > 0 ? "Needs follow-up" : "None this week",
        trendUp: false,
      },
    ];
  }, [appointments]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const durationVal = form.duration.trim() || "30 mins";

    if (modalMode === "edit" && editingId) {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                patientName: form.patientName,
                patientPhone: form.patientPhone,
                treatment: form.treatment,
                doctor: form.doctor,
                date: form.date,
                time: form.time,
                duration: durationVal,
                status: form.status,
                notes: form.notes,
              }
            : a
        )
      );
      setSelected((prev) =>
        prev && prev.id === editingId
          ? {
              ...prev,
              patientName: form.patientName,
              patientPhone: form.patientPhone,
              treatment: form.treatment,
              doctor: form.doctor,
              date: form.date,
              time: form.time,
              duration: durationVal,
              status: form.status,
              notes: form.notes,
            }
          : prev
      );
    } else {
      const nextNumber = 1000 + appointments.length + 1;
      const newAppointment: Appointment = {
        id: String(Date.now()),
        appointmentId: `APT-${nextNumber}`,
        patientName: form.patientName,
        patientPhone: form.patientPhone,
        treatment: form.treatment,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        duration: durationVal,
        status: form.status,
        notes: form.notes,
        createdDate: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      setAppointments((prev) => [newAppointment, ...prev]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <CalendarClock className="absolute -left-8 top-20 h-44 w-44 -rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Stethoscope className="absolute right-6 top-52 h-32 w-32 rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <HeartPulse className="absolute left-[22%] bottom-32 h-28 w-28 -rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Cross className="absolute right-[10%] bottom-20 h-20 w-20 rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Pill className="absolute left-[48%] top-8 h-16 w-16 rotate-45 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Activity className="absolute right-[32%] bottom-[6%] h-24 w-24 text-[#7da3b3]/[0.07]" strokeWidth={1} />
      </div>

      <div className="sticky top-0 z-20 w-full bg-white px-6 py-6 lg:px-10">
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl">
          Appointments
        </h1>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10">
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-[0.85rem] font-medium text-slate-500">{stat.label}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[#3f6274]">
                  <stat.icon className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patient, treatment, doctor..."
                  className="w-64 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "All" | Status)}
                  className="appearance-none rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-8 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
                >
                  <option value="All">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as "All" | "Today" | "Upcoming")}
                  className="appearance-none rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-8 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
                >
                  <option value="All">All dates</option>
                  <option value="Today">Today</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#749fb1] px-5 py-2.5 text-[0.9rem] font-medium text-white shadow-sm transition-colors hover:bg-[#345263]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Appointment
            </button>
          </div>

          {/* List */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/5">
            {/* Header row */}
            <div
              className={`${LIST_GRID} hidden bg-slate-50 px-5 py-3 text-[0.75rem] font-medium uppercase tracking-wide text-slate-500 sm:grid`}
            >
              <span>Name</span>
              <span>Doctor</span>
              <span>Date &amp; Time</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-900/5">
              {filtered.map((a) => {
                const StatusIcon = STATUS_ICONS[a.status];
                const statusColor = STATUS_COLORS[a.status];
                const avatarColor = avatarColorFor(a.patientName);

                return (
                  <div
                    key={a.id}
                    onClick={() => openProfile(a)}
                    className={`${LIST_GRID} group cursor-pointer flex-wrap gap-y-3 bg-white px-5 py-4 transition-colors hover:bg-[#7da3b3]/[0.06] max-sm:flex`}
                  >
                    <div className="flex min-w-[10rem] items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-semibold ${avatarColor}`}
                      >
                        {getInitials(a.patientName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.95rem] font-semibold text-slate-900">{a.patientName}</p>
                        <p className="truncate text-[0.8rem] text-slate-500">{a.treatment}</p>
                      </div>
                    </div>

                    <div className="min-w-[8rem] text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {a.doctor}
                      </p>
                    </div>

                    <div className="min-w-[10rem] text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {formatDateLabel(a.date)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {formatTimeLabel(a.time)} · {a.duration}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium ${statusColor}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
                      {a.status}
                    </span>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(a);
                        }}
                        aria-label="Edit appointment"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <SquarePen className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDelete(a);
                        }}
                        disabled={deletingId === a.id}
                        aria-label="Delete appointment"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="bg-white py-16 text-center text-slate-500">
                  No appointments match your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0" aria-hidden />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <h2 className="text-[0.95rem] font-semibold text-slate-900">
                {modalMode === "edit" ? "Edit Appointment" : "Add Appointment"}
              </h2>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      Patient name
                    </span>
                    <input
                      required
                      type="text"
                      value={form.patientName}
                      onChange={(e) => update("patientName", e.target.value)}
                      placeholder="Sabina Karki"
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
                      value={form.patientPhone}
                      onChange={(e) => update("patientPhone", e.target.value)}
                      placeholder="98410 22314"
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                      Treatment
                    </span>
                    <select
                      value={form.treatment}
                      onChange={(e) => update("treatment", e.target.value)}
                      className={inputClass}
                    >
                      {TREATMENT_OPTIONS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      Doctor
                    </span>
                    <select
                      value={form.doctor}
                      onChange={(e) => update("doctor", e.target.value)}
                      className={inputClass}
                    >
                      {DOCTOR_OPTIONS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
                      Date
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
                      Time
                    </span>
                    <input
                      required
                      type="time"
                      value={form.time}
                      onChange={(e) => update("time", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      Duration
                    </span>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => update("duration", e.target.value)}
                      placeholder="30 mins"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                      Status
                    </span>
                    <select
                      value={form.status}
                      onChange={(e) => update("status", e.target.value as Status)}
                      className={inputClass}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                    Notes
                  </span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Any relevant notes for this appointment"
                    className={textareaClass}
                  />
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-[#345263]"
                  >
                    {modalMode === "edit" ? "Save Changes" : "Add Appointment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full px-5 py-2.5 text-[0.9rem] font-medium text-slate-500 transition-colors hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail side panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div onClick={() => setSelected(null)} className="absolute inset-0" aria-hidden />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <button
                onClick={() => requestDelete(selected)}
                disabled={deletingId === selected.id}
                aria-label="Delete appointment"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Delete
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-[1.15rem] font-semibold ring-4 ring-white ${avatarColorFor(
                    selected.patientName
                  )}`}
                >
                  {getInitials(selected.patientName)}
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selected.patientName}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-slate-500">
                    <span>{selected.treatment}</span>
                    <span className="text-slate-300">|</span>
                    <span>{formatDateLabel(selected.date)}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-medium text-slate-700">{formatTimeLabel(selected.time)}</span>
                  </div>

                  <span
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.78rem] font-medium ${STATUS_COLORS[selected.status]}`}
                  >
                    {(() => {
                      const StatusIcon = STATUS_ICONS[selected.status];
                      return <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />;
                    })()}
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex items-center gap-6 border-b border-slate-900/10">
                {(
                  [
                    { key: "detail", label: "Detail Information" },
                    { key: "notes", label: "Notes" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProfileTab(tab.key)}
                    className={`-mb-px border-b-2 px-1 pb-3 text-[0.85rem] font-medium transition-colors ${
                      profileTab === tab.key
                        ? "border-[#3f6274] text-[#3f6274]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {profileTab === "detail" && (
                <div className="mt-5 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                    Appointment Information
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-y-4 text-[0.85rem]">
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                        Appointment ID
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selected.appointmentId}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <User className="h-3.5 w-3.5" strokeWidth={2} />
                        Doctor
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selected.doctor}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                        Phone
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selected.patientPhone}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Duration
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selected.duration}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Created Date
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selected.createdDate ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "notes" && (
                <div className="mt-5 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                    Notes
                  </p>
                  {selected.notes ? (
                    <p className="mt-3 text-[0.85rem] leading-relaxed text-slate-600">{selected.notes}</p>
                  ) : (
                    <p className="mt-3 text-[0.85rem] text-slate-500">No notes recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div onClick={() => setDeleteTarget(null)} className="absolute inset-0" aria-hidden />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-[1.05rem] font-semibold text-slate-900">Delete appointment?</h3>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-slate-500">
              This will remove <span className="font-medium text-slate-700">{deleteTarget.patientName}</span>'s
              appointment from your schedule. This can't be undone from here.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
                className="flex-1 rounded-full bg-rose-500 px-4 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
                className="flex-1 rounded-full border border-slate-900/10 px-4 py-2.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}