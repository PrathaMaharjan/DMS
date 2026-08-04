"use client";

import { useMemo, useState } from "react";
import {
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
  Activity,
  CalendarDays,
  Sparkles,
  UserPlus,
  Clock3,
  CalendarClock,
  HeartPulse,
  Cross,
  Pill,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Banknote,
} from "lucide-react";

const PIE_COLORS = ["#7da3b3", "#10b981", "#6366f1", "#f59e0b", "#345263", "#ec4899", "#8b5cf6", "#06b6d4"];

const OUTLETS = [
  { id: "all", name: "All outlets" },
  { id: "outlet-1", name: "Chitwan Dental Home - Bharatpur" },
  { id: "outlet-2", name: "Chitwan Dental Home - Narayangarh" },
  { id: "outlet-3", name: "Chitwan Dental Home - Ratnanagar" },
];

type OutletStats = {
  outletId: string;
  totalPatients: number;
  appointmentsToday: number;
  activeDoctors: number;
  pendingRequests: number;
  revenueThisMonth: number;
};

const SEED_OUTLET_STATS: OutletStats[] = [
  { outletId: "outlet-1", totalPatients: 842, appointmentsToday: 24, activeDoctors: 6, pendingRequests: 5, revenueThisMonth: 1250000 },
  { outletId: "outlet-2", totalPatients: 415, appointmentsToday: 11, activeDoctors: 3, pendingRequests: 2, revenueThisMonth: 640000 },
  { outletId: "outlet-3", totalPatients: 260, appointmentsToday: 8, activeDoctors: 2, pendingRequests: 3, revenueThisMonth: 380000 },
];

type TrendPoint = { label: string; count: number };

const SEED_TREND: Record<"7d" | "14d" | "1m" | "1y", Record<string, TrendPoint[]>> = {
  "7d": {
    "outlet-1": [
      { label: "Mon", count: 4 }, { label: "Tue", count: 6 }, { label: "Wed", count: 3 },
      { label: "Thu", count: 7 }, { label: "Fri", count: 5 }, { label: "Sat", count: 8 }, { label: "Sun", count: 2 },
    ],
    "outlet-2": [
      { label: "Mon", count: 2 }, { label: "Tue", count: 3 }, { label: "Wed", count: 1 },
      { label: "Thu", count: 4 }, { label: "Fri", count: 2 }, { label: "Sat", count: 3 }, { label: "Sun", count: 1 },
    ],
    "outlet-3": [
      { label: "Mon", count: 1 }, { label: "Tue", count: 2 }, { label: "Wed", count: 1 },
      { label: "Thu", count: 2 }, { label: "Fri", count: 1 }, { label: "Sat", count: 2 }, { label: "Sun", count: 0 },
    ],
  },
  "14d": {
    "outlet-1": Array.from({ length: 14 }, (_, i) => ({ label: `D${i + 1}`, count: 3 + ((i * 5) % 9) })),
    "outlet-2": Array.from({ length: 14 }, (_, i) => ({ label: `D${i + 1}`, count: 1 + ((i * 3) % 6) })),
    "outlet-3": Array.from({ length: 14 }, (_, i) => ({ label: `D${i + 1}`, count: (i * 2) % 5 })),
  },
  "1m": {
    "outlet-1": Array.from({ length: 4 }, (_, i) => ({ label: `Week ${i + 1}`, count: 22 + i * 4 })),
    "outlet-2": Array.from({ length: 4 }, (_, i) => ({ label: `Week ${i + 1}`, count: 10 + i * 2 })),
    "outlet-3": Array.from({ length: 4 }, (_, i) => ({ label: `Week ${i + 1}`, count: 6 + i })),
  },
  "1y": {
    "outlet-1": ["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => ({ label: m, count: 40 + i * 6 })),
    "outlet-2": ["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => ({ label: m, count: 18 + i * 3 })),
    "outlet-3": ["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => ({ label: m, count: 10 + i * 2 })),
  },
};

type TreatmentItem = { name: string; value: number };

const SEED_TREATMENTS: Record<string, TreatmentItem[]> = {
  "outlet-1": [
    { name: "Cleaning", value: 120 }, { name: "Root Canal", value: 45 },
    { name: "Whitening", value: 60 }, { name: "Orthodontics", value: 30 }, { name: "Extraction", value: 25 },
  ],
  "outlet-2": [
    { name: "Cleaning", value: 55 }, { name: "Root Canal", value: 18 },
    { name: "Whitening", value: 22 }, { name: "Orthodontics", value: 10 }, { name: "Extraction", value: 12 },
  ],
  "outlet-3": [
    { name: "Cleaning", value: 30 }, { name: "Root Canal", value: 9 },
    { name: "Whitening", value: 14 }, { name: "Orthodontics", value: 5 }, { name: "Extraction", value: 7 },
  ],
};

type AppointmentItem = {
  id: string;
  outletId: string;
  patientName: string;
  doctorName: string;
  treatmentName: string;
  startTime: string;
  status: string;
};

const SEED_APPOINTMENTS: AppointmentItem[] = [
  { id: "a1", outletId: "outlet-1", patientName: "Rita Adhikari", doctorName: "Dr. Anish Shrestha", treatmentName: "Root Canal", startTime: "09:30", status: "confirmed" },
  { id: "a2", outletId: "outlet-1", patientName: "Suman Rai", doctorName: "Dr. Priya Gurung", treatmentName: "Cleaning", startTime: "10:15", status: "checked_in" },
  { id: "a3", outletId: "outlet-2", patientName: "Anjali Poudel", doctorName: "Dr. Sarita Lama", treatmentName: "Whitening", startTime: "11:00", status: "requested" },
  { id: "a4", outletId: "outlet-3", patientName: "Kiran Basnet", doctorName: "Dr. Bikash Gurung", treatmentName: "Extraction", startTime: "13:30", status: "completed" },
  { id: "a5", outletId: "outlet-1", patientName: "Meena Tamang", doctorName: "Dr. Anish Shrestha", treatmentName: "Orthodontic Consult", startTime: "14:00", status: "confirmed" },
  { id: "a6", outletId: "outlet-2", patientName: "Rajesh Koirala", doctorName: "Dr. Sarita Lama", treatmentName: "Cleaning", startTime: "15:20", status: "cancelled" },
];

type ActivityItem = {
  outletId: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
};

const SEED_ACTIVITY: ActivityItem[] = [
  { outletId: "outlet-1", type: "appointment_booked", title: "New appointment booked", description: "Rita Adhikari booked Root Canal with Dr. Anish", timestamp: "2026-08-03T08:10:00" },
  { outletId: "outlet-2", type: "patient_registered", title: "New patient registered", description: "Anjali Poudel added to Narayangarh outlet", timestamp: "2026-08-03T07:40:00" },
  { outletId: "outlet-1", type: "treatment_added", title: "New treatment added", description: "Zirconia Crown added to treatment list", timestamp: "2026-08-02T16:20:00" },
  { outletId: "outlet-3", type: "schedule_updated", title: "Doctor schedule updated", description: "Dr. Bikash Gurung updated Friday availability", timestamp: "2026-08-02T14:05:00" },
  { outletId: "outlet-2", type: "appointment_booked", title: "New appointment booked", description: "Rajesh Koirala booked Cleaning with Dr. Sarita", timestamp: "2026-08-01T11:30:00" },
];

function getStatusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed") return { label: "Completed", class: "bg-[#7da3b3]/15 text-[#3f6274]" };
  if (s === "checked_in") return { label: "Checked In", class: "bg-[#345263] text-white" };
  if (s === "confirmed") return { label: "Confirmed", class: "bg-sky-100 text-sky-700" };
  if (s === "requested") return { label: "Pending", class: "bg-amber-100 text-amber-700" };
  if (s === "cancelled") return { label: "Cancelled", class: "bg-rose-100 text-rose-700" };
  return { label: status, class: "bg-slate-100 text-slate-700" };
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "appointment_booked":
      return { icon: CalendarCheck, iconBg: "bg-emerald-100 text-emerald-700" };
    case "patient_registered":
      return { icon: UserPlus, iconBg: "bg-[#7da3b3]/20 text-[#3f6274]" };
    case "treatment_added":
      return { icon: Sparkles, iconBg: "bg-violet-100 text-violet-700" };
    case "schedule_updated":
      return { icon: Clock3, iconBg: "bg-amber-100 text-amber-700" };
    default:
      return { icon: Activity, iconBg: "bg-slate-100 text-slate-700" };
  }
}

function getRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function centsToDisplay(n: number) {
  return n.toLocaleString();
}

const ITEMS_PER_PAGE = 5;

export default function OrganizationDashboardPage() {
  const [outletFilter, setOutletFilter] = useState("all");
  const [timeframe, setTimeframe] = useState<"7d" | "14d" | "1m" | "1y">("14d");

  const [apptsPage, setApptsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  const activeOutletIds = useMemo(
    () => (outletFilter === "all" ? OUTLETS.filter((o) => o.id !== "all").map((o) => o.id) : [outletFilter]),
    [outletFilter]
  );

  const stats = useMemo(() => {
    const rows = SEED_OUTLET_STATS.filter((s) => activeOutletIds.includes(s.outletId));
    return rows.reduce(
      (acc, r) => ({
        totalPatients: acc.totalPatients + r.totalPatients,
        appointmentsToday: acc.appointmentsToday + r.appointmentsToday,
        activeDoctors: acc.activeDoctors + r.activeDoctors,
        pendingRequests: acc.pendingRequests + r.pendingRequests,
      }),
      { totalPatients: 0, appointmentsToday: 0, activeDoctors: 0, pendingRequests: 0 }
    );
  }, [activeOutletIds]);

  const registrationData = useMemo(() => {
    const perOutlet = SEED_TREND[timeframe];
    const relevant = activeOutletIds.map((id) => perOutlet[id] ?? []);
    if (relevant.length === 0) return [];
    const length = relevant[0].length;
    return Array.from({ length }, (_, i) => ({
      label: relevant[0][i]?.label ?? "",
      count: relevant.reduce((sum, arr) => sum + (arr[i]?.count ?? 0), 0),
    }));
  }, [activeOutletIds, timeframe]);

  const treatmentPopularity = useMemo(() => {
    const combined = new Map<string, number>();
    activeOutletIds.forEach((id) => {
      (SEED_TREATMENTS[id] ?? []).forEach((t) => {
        combined.set(t.name, (combined.get(t.name) ?? 0) + t.value);
      });
    });
    return Array.from(combined.entries()).map(([name, value], idx) => ({
      name,
      value,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }));
  }, [activeOutletIds]);

  const todaysAppointments = useMemo(
    () => SEED_APPOINTMENTS.filter((a) => activeOutletIds.includes(a.outletId)),
    [activeOutletIds]
  );

  const activityFeed = useMemo(
    () =>
      SEED_ACTIVITY.filter((a) => activeOutletIds.includes(a.outletId)).sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp)
      ),
    [activeOutletIds]
  );

  const outletPerformance = useMemo(
    () => SEED_OUTLET_STATS.filter((s) => activeOutletIds.includes(s.outletId)),
    [activeOutletIds]
  );

  const maxRevenue = Math.max(...SEED_OUTLET_STATS.map((s) => s.revenueThisMonth), 1);

  const totalApptsPages = Math.max(1, Math.ceil(todaysAppointments.length / ITEMS_PER_PAGE));
  const paginatedAppts = todaysAppointments.slice(
    (apptsPage - 1) * ITEMS_PER_PAGE,
    apptsPage * ITEMS_PER_PAGE
  );

  const totalActivityPages = Math.max(1, Math.ceil(activityFeed.length / ITEMS_PER_PAGE));
  const paginatedActivity = activityFeed.slice(
    (activityPage - 1) * ITEMS_PER_PAGE,
    activityPage * ITEMS_PER_PAGE
  );

  function outletName(id: string) {
    return OUTLETS.find((o) => o.id === id)?.name ?? id;
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

      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 w-full border-b border-slate-100 bg-white px-6 py-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl">
            Organization Dashboard
          </h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
              <select
                value={outletFilter}
                onChange={(e) => {
                  setOutletFilter(e.target.value);
                  setApptsPage(1);
                  setActivityPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-[0.85rem] font-medium text-[#345263] shadow-sm outline-none focus:border-[#7da3b3]"
              >
                {OUTLETS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
              <RefreshCw className="h-3.5 w-3.5 text-[#7da3b3]" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] space-y-6 px-6 pb-10 pt-6 lg:px-10">
        {/* Top 4 Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Patients</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalPatients.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Appointments</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <CalendarCheck className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {stats.appointmentsToday} <span className="text-xs font-medium text-slate-400">Today</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Doctors</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Stethoscope className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {stats.activeDoctors} <span className="text-xs font-medium text-slate-400">Staff</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Requests</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Inbox className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.pendingRequests}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">New Patient Registrations Trend</h3>
              </div>

              <div className="flex items-center gap-1 self-start rounded-xl bg-slate-100 p-1 sm:self-auto">
                {(["7d", "14d", "1m", "1y"] as const).map((tf) => {
                  const labels: Record<string, string> = { "7d": "7 Days", "14d": "14 Days", "1m": "1 Month", "1y": "1 Year" };
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold transition-colors ${
                        timeframe === tf ? "bg-white text-[#345263] shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {labels[tf]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative h-64 w-full pt-2">
              {registrationData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No registration data available for this timeframe.
                </div>
              ) : (
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
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/15 text-[#345263]">
                <PieChartIcon className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Treatment Popularity</h3>
            </div>

            <div className="h-64 w-full">
              {treatmentPopularity.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No treatment data recorded.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={treatmentPopularity} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {treatmentPopularity.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#64748b" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Outlet Performance */}
        <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
              <Building2 className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">Outlet Performance This Month</h3>
          </div>

          {outletPerformance.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No outlets in this selection.</div>
          ) : (
            <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
              {outletPerformance.map((o) => (
                <div key={o.outletId} className="space-y-3 rounded-xl border border-slate-100 bg-[#f4fafc]/60 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-xs font-bold text-slate-900">{outletName(o.outletId)}</h4>
                  </div>

                  <div className="flex items-center justify-between text-[0.7rem] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {o.totalPatients} patients
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3" /> {o.appointmentsToday} today
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[0.7rem] font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3 w-3" /> NPR {centsToDisplay(o.revenueThisMonth)}
                      </span>
                      <span>{o.activeDoctors} doctors</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#7da3b3] transition-all"
                        style={{ width: `${Math.min((o.revenueThisMonth / maxRevenue) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/15 text-[#3f6274]">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Today's Appointments Across Outlets</h3>
              </div>
            </div>

            {todaysAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No appointments scheduled for today.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-4">Patient</th>
                        <th className="pb-3 px-4">Outlet</th>
                        <th className="pb-3 px-4">Doctor</th>
                        <th className="pb-3 px-4">Service</th>
                        <th className="pb-3 px-4">Time</th>
                        <th className="pb-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedAppts.map((apt) => {
                        const badge = getStatusBadge(apt.status);
                        return (
                          <tr key={apt.id} className="transition-colors hover:bg-slate-50/60">
                            <td className="py-3 pr-4 font-bold text-slate-900">{apt.patientName}</td>
                            <td className="py-3 px-4 text-slate-500">{outletName(apt.outletId)}</td>
                            <td className="py-3 px-4 font-medium text-slate-600">{apt.doctorName}</td>
                            <td className="py-3 px-4 text-slate-500">{apt.treatmentName}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{formatTime(apt.startTime)}</td>
                            <td className="py-3 pl-4 text-right">
                              <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${badge.class}`}>
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Page {apptsPage} of {totalApptsPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={apptsPage <= 1}
                      onClick={() => setApptsPage((p) => Math.max(1, p - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={apptsPage >= totalApptsPages}
                      onClick={() => setApptsPage((p) => Math.min(totalApptsPages, p + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm lg:col-span-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Activity className="h-4 w-4 text-[#7da3b3]" /> Recent Activity Feed
            </h3>

            {activityFeed.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No recent activity logged yet.</div>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedActivity.map((act, index) => {
                    const { icon: Icon, iconBg } = getActivityIcon(act.type);
                    return (
                      <div key={`${act.type}-${index}`} className="flex gap-3 text-xs">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{act.title}</p>
                          <p className="mt-0.5 text-[0.7rem] text-slate-400">{outletName(act.outletId)}</p>
                          <p className="mt-0.5 line-clamp-2 text-[0.75rem] text-slate-500">{act.description}</p>
                          <span className="text-[0.65rem] text-slate-400">{getRelativeTime(act.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>Page {activityPage} of {totalActivityPages}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={activityPage <= 1}
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      disabled={activityPage >= totalActivityPages}
                      onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}