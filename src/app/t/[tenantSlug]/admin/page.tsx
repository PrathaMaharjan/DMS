"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  CalendarCheck,
  Stethoscope,
  Inbox,
  TrendingUp,
  PieChart as PieChartIcon,
  Plus,
  ArrowRight,
  Activity,
  CalendarDays,
  Sparkles,
  UserPlus,
  XCircle,
  Clock3,
  LayoutDashboard,
  CalendarClock,
  HeartPulse,
  Cross,
  Pill,
} from "lucide-react";



const MOCK_STATS = {
  totalPatients: 1428,
  appointmentsToday: 18,
  appointmentsThisWeek: 94,
  activeDoctors: 6,
  pendingRequests: 5,
};

// Trend Data Sets based on selected timeframe
const REGISTRATION_DATA: Record<string, { label: string; count: number }[]> = {
  "7d": [
    { label: "Day 1", count: 8 },
    { label: "Day 2", count: 11 },
    { label: "Day 3", count: 7 },
    { label: "Day 4", count: 14 },
    { label: "Day 5", count: 10 },
    { label: "Day 6", count: 16 },
    { label: "Day 7", count: 18 },
  ],
  "14d": [
    { label: "Day 1", count: 4 },
    { label: "Day 2", count: 7 },
    { label: "Day 3", count: 5 },
    { label: "Day 4", count: 9 },
    { label: "Day 5", count: 6 },
    { label: "Day 6", count: 12 },
    { label: "Day 7", count: 8 },
    { label: "Day 8", count: 11 },
    { label: "Day 9", count: 7 },
    { label: "Day 10", count: 14 },
    { label: "Day 11", count: 10 },
    { label: "Day 12", count: 16 },
    { label: "Day 13", count: 13 },
    { label: "Day 14", count: 18 },
  ],
  "1m": [
    { label: "W1", count: 42 },
    { label: "W2", count: 58 },
    { label: "W3", count: 64 },
    { label: "W4", count: 79 },
  ],
  "1y": [
    { label: "Jan", count: 120 },
    { label: "Feb", count: 135 },
    { label: "Mar", count: 150 },
    { label: "Apr", count: 140 },
    { label: "May", count: 168 },
    { label: "Jun", count: 180 },
    { label: "Jul", count: 195 },
    { label: "Aug", count: 210 },
    { label: "Sep", count: 188 },
    { label: "Oct", count: 225 },
    { label: "Nov", count: 240 },
    { label: "Dec", count: 260 },
  ],
};

const MOCK_TREATMENT_POPULARITY = [
  { name: "Root Canal", value: 34, color: "#7da3b3" },
  { name: "Routine Cleaning", value: 48, color: "#10b981" },
  { name: "Teeth Whitening", value: 28, color: "#6366f1" },
  { name: "Orthodontics", value: 22, color: "#f59e0b" },
  { name: "Dental Fillings", value: 39, color: "#345263" },
  { name: "Tooth Extraction", value: 16, color: "#ec4899" },
];

const MOCK_DOCTOR_UTILIZATION = [
  { name: "Dr. Sarah Mitchell", booked: 7, total: 8, open: 1, utilization: 88 },
  { name: "Dr. Sophan Shrestha", booked: 6, total: 8, open: 2, utilization: 75 },
  { name: "Dr. Pratha Maharjan", booked: 5, total: 7, open: 2, utilization: 71 },
  { name: "Dr. Suprasidhhi Pradhan", booked: 4, total: 8, open: 4, utilization: 50 },
  { name: "Dr. Pragun Maskey", booked: 6, total: 6, open: 0, utilization: 100 },
  { name: "Dr. Anish Karki", booked: 3, total: 8, open: 5, utilization: 38 },
];

const MOCK_TODAYS_APPOINTMENTS = [
  {
    id: "apt-101",
    patient: "Emily Carter",
    doctor: "Dr. Sarah Mitchell",
    service: "Root Canal",
    time: "09:00 AM",
    status: "Completed",
    badgeClass: "bg-[#7da3b3]/15 text-[#3f6274]",
  },
  {
    id: "apt-102",
    patient: "James Whitfield",
    doctor: "Dr. Sophan Shrestha",
    service: "Routine Cleaning",
    time: "10:30 AM",
    status: "Completed",
    badgeClass: "bg-[#7da3b3]/15 text-[#3f6274]",
  },
  {
    id: "apt-103",
    patient: "Priya Nandakumar",
    doctor: "Dr. Pratha Maharjan",
    service: "Cavity Filling",
    time: "11:15 AM",
    status: "In Progress",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "apt-104",
    patient: "Marcus Chen",
    doctor: "Dr. Pragun Maskey",
    service: "Consultation",
    time: "01:00 PM",
    status: "Checked In",
    badgeClass: "bg-[#345263] text-white",
  },
  {
    id: "apt-105",
    patient: "Aaliyah Robinson",
    doctor: "Dr. Sarah Mitchell",
    service: "Teeth Whitening",
    time: "02:30 PM",
    status: "Confirmed",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "apt-106",
    patient: "Oliver Bennett",
    doctor: "Dr. Suprasidhhi Pradhan",
    service: "Wisdom Tooth Extraction",
    time: "04:00 PM",
    status: "Confirmed",
    badgeClass: "bg-sky-100 text-sky-700",
  },
];

const MOCK_ACTIVITY_FEED = [
  {
    id: "act-1",
    title: "New Appointment Booked",
    description: "Patient Emily Carter booked for Root Canal with Dr. Sarah Mitchell",
    time: "10 minutes ago",
    icon: CalendarCheck,
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "act-2",
    title: "New Patient Registered",
    description: "Marcus Chen created a new profile account",
    time: "35 minutes ago",
    icon: UserPlus,
    iconBg: "bg-[#7da3b3]/20 text-[#3f6274]",
  },
  {
    id: "act-3",
    title: "Appointment Cancelled",
    description: "Nina Foster cancelled 4:45 PM consultation",
    time: "1 hour ago",
    icon: XCircle,
    iconBg: "bg-rose-100 text-rose-700",
  },
  {
    id: "act-4",
    title: "Doctor Working Hours Updated",
    description: "Dr. Pragun Maskey updated Wednesday shift schedule",
    time: "2 hours ago",
    icon: Clock3,
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    id: "act-5",
    title: "Treatment Added",
    description: "Admin added new service: Invisible Orthodontic Aligners",
    time: "4 hours ago",
    icon: Sparkles,
    iconBg: "bg-violet-100 text-violet-700",
  },
];

export default function AdminDashboardPage() {
  const params = useParams<{ tenantSlug: string }>();
  const adminRoot = `/t/${params.tenantSlug}/admin`;

  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "1m" | "1y">("14d");

  const registrationData = useMemo(() => {
    return REGISTRATION_DATA[timeframe];
  }, [timeframe]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Decorative Background Icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <CalendarClock className="absolute -left-8 top-20 h-44 w-44 -rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Stethoscope className="absolute right-6 top-52 h-32 w-32 rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <HeartPulse className="absolute left-[22%] bottom-32 h-28 w-28 -rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Cross className="absolute right-[10%] bottom-20 h-20 w-20 rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Pill className="absolute left-[48%] top-8 h-16 w-16 rotate-45 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Activity className="absolute right-[32%] bottom-[6%] h-24 w-24 text-[#7da3b3]/[0.07]" strokeWidth={1} />
      </div>

      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 w-full bg-white px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl flex items-center gap-2.5">

            Dashboard
          </h1>


        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10 space-y-6">
        {/* Top 4 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Patients */}
          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Patients
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_STATS.totalPatients.toLocaleString()}
              </p>

            </div>
          </div>

          {/* Appointments Today / Week */}
          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Appointments
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <CalendarCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_STATS.appointmentsToday} <span className="text-xs font-medium text-slate-400">Today</span>
              </p>

            </div>
          </div>

          {/* Active Doctors */}
          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Doctors
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Stethoscope className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_STATS.activeDoctors} <span className="text-xs font-medium text-slate-400">Staff</span>
              </p>

            </div>
          </div>

          {/* Pending Requests */}
          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Requests
              </p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Inbox className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                {MOCK_STATS.pendingRequests}
              </p>

            </div>
          </div>
        </div>

        {/* Main Charts Section */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* New Patient Registrations Trend (Chart) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">New Patient Registrations Trend</h3>

                </div>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setTimeframe("7d")}
                  className={`px-2.5 py-1 text-[0.7rem] font-semibold rounded-lg transition-colors ${timeframe === "7d"
                    ? "bg-white text-[#345263] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("14d")}
                  className={`px-2.5 py-1 text-[0.7rem] font-semibold rounded-lg transition-colors ${timeframe === "14d"
                    ? "bg-white text-[#345263] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("1m")}
                  className={`px-2.5 py-1 text-[0.7rem] font-semibold rounded-lg transition-colors ${timeframe === "1m"
                    ? "bg-white text-[#345263] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframe("1y")}
                  className={`px-2.5 py-1 text-[0.7rem] font-semibold rounded-lg transition-colors ${timeframe === "1y"
                    ? "bg-white text-[#345263] shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  1 Year
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7da3b3" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7da3b3" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="count" name="New Patients" stroke="#7da3b3" strokeWidth={2.5} fillOpacity={1} fill="url(#patientGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Treatment Popularity (Chart) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/15 text-[#345263]">
                <PieChartIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Treatment Popularity</h3>

              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_TREATMENT_POPULARITY}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {MOCK_TREATMENT_POPULARITY.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px", color: "#64748b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Doctor Utilization Section */}
        <div className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Doctor Utilization & Open Slots</h3>

              </div>
            </div>
            <Link
              href={`${adminRoot}/doctors`}
              className="flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
            >
              Manage Doctors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {MOCK_DOCTOR_UTILIZATION.map((doc) => (
              <div key={doc.name} className="p-4 rounded-xl border border-slate-100 bg-[#f4fafc]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${doc.utilization >= 90
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : doc.utilization >= 60
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                  >
                    {doc.utilization}% Booked
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[0.7rem] text-slate-500 font-medium">
                    <span>{doc.booked} Booked Slots</span>
                    <span>{doc.open} Open Slots</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className="h-full bg-[#7da3b3] rounded-full transition-all"
                      style={{ width: `${doc.utilization}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Grid: Today's Appointments Table + Activity Feed */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Today's Appointments (Across All Doctors Table) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today's Appointments Across Doctors</h3>

                </div>
              </div>
              <Link
                href={`${adminRoot}/appointments`}
                className="flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
              >
                View All Appointments <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">Patient</th>
                    <th className="pb-3 px-4">Doctor</th>
                    <th className="pb-3 px-4">Service</th>
                    <th className="pb-3 px-4">Time</th>
                    <th className="pb-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {MOCK_TODAYS_APPOINTMENTS.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pr-4 font-bold text-slate-900">{apt.patient}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{apt.doctor}</td>
                      <td className="py-3 px-4 text-slate-500">{apt.service}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{apt.time}</td>
                      <td className="py-3 pl-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold ${apt.badgeClass}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Widget: Recent Activity Feed */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#7da3b3]" /> Recent Activity Feed
            </h3>

            <div className="space-y-4">
              {MOCK_ACTIVITY_FEED.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${act.iconBg}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{act.title}</p>
                      <p className="text-[0.75rem] text-slate-500 line-clamp-2 mt-0.5">{act.description}</p>
                      <span className="text-[0.65rem] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}