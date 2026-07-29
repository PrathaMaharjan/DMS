"use client";

import { useState, useMemo } from "react";
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
} from "recharts";
import {
    CalendarCheck,
    CheckCircle2,
    CalendarClock,
    Users,
    Clock,
    User,
    Phone,
    Stethoscope,
    ArrowRight,
    ClipboardList,
    Sparkles,
    StickyNote,
    History,
    TrendingUp,
    UserRoundCheck,
    PieChart as PieChartIcon,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    Confirmed: "#7da3b3",
    "Checked In": "#10b981",
    Completed: "#64748b",
    "No-Show": "#f43f5e",
    Cancelled: "#cbd5e1",
};

interface AppointmentLite {
    id: string;
    patient: string;
    patientId?: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    rawStatus: string;
    notes?: string;
    startTime?: string;
}

interface RecentPatient {
    id: string;
    name: string;
    lastVisit: string;
    treatment: string;
}

function toDateKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function keyDaysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toDateKey(d);
}

// ---- Static mock data -------------------------------------------------

const MOCK_DOCTOR_NAME = "Dr. Sarah Mitchell";

const todayKeyStatic = toDateKey(new Date());

const MOCK_APPOINTMENTS: AppointmentLite[] = [
    // Today
    {
        id: "apt-1",
        patient: "Emily Carter",
        patientId: "pat-1",
        phone: "(555) 012-3344",
        service: "Root Canal",
        date: todayKeyStatic,
        time: "09:00",
        rawStatus: "completed",
        notes: "Follow-up in 2 weeks, mild sensitivity reported.",
    },
    {
        id: "apt-2",
        patient: "James Whitfield",
        patientId: "pat-2",
        phone: "(555) 221-9087",
        service: "Routine Cleaning",
        date: todayKeyStatic,
        time: "10:30",
        rawStatus: "completed",
        notes: "",
    },
    {
        id: "apt-3",
        patient: "Priya Nandakumar",
        patientId: "pat-3",
        phone: "(555) 774-2201",
        service: "Cavity Filling",
        date: todayKeyStatic,
        time: "11:15",
        rawStatus: "checked_in",
        notes: "Patient requested numbing gel before injection.",
    },
    {
        id: "apt-4",
        patient: "Marcus Chen",
        patientId: "pat-4",
        phone: "(555) 400-1122",
        service: "Consultation",
        date: todayKeyStatic,
        time: "13:00",
        rawStatus: "confirmed",
        notes: "",
    },
    {
        id: "apt-5",
        patient: "Aaliyah Robinson",
        patientId: "pat-5",
        phone: "(555) 998-3345",
        service: "Teeth Whitening",
        date: todayKeyStatic,
        time: "14:30",
        rawStatus: "confirmed",
        notes: "First-time whitening patient, went over aftercare.",
    },
    {
        id: "apt-6",
        patient: "Oliver Bennett",
        patientId: "pat-6",
        phone: "(555) 555-7788",
        service: "Wisdom Tooth Extraction",
        date: todayKeyStatic,
        time: "16:00",
        rawStatus: "confirmed",
        notes: "",
    },
    {
        id: "apt-6b",
        patient: "Nina Foster",
        patientId: "pat-13",
        phone: "(555) 322-7710",
        service: "X-Ray & Consult",
        date: todayKeyStatic,
        time: "16:45",
        rawStatus: "cancelled",
        notes: "",
    },
    // Past week (for the weekly trend chart)
    { id: "apt-w1", patient: "Grace Kim", phone: "-", service: "Cleaning", date: keyDaysAgo(1), time: "09:00", rawStatus: "completed" },
    { id: "apt-w2", patient: "Daniel Osei", phone: "-", service: "Crown Fitting", date: keyDaysAgo(1), time: "11:00", rawStatus: "completed" },
    { id: "apt-w3", patient: "Fatima Al-Sayed", phone: "-", service: "Consultation", date: keyDaysAgo(1), time: "15:30", rawStatus: "completed" },
    { id: "apt-w4", patient: "Liam Novak", phone: "-", service: "Whitening", date: keyDaysAgo(2), time: "10:00", rawStatus: "completed" },
    { id: "apt-w5", patient: "Sofia Reyes", phone: "-", service: "Extraction", date: keyDaysAgo(2), time: "13:15", rawStatus: "completed" },
    { id: "apt-w6", patient: "Noah Fischer", phone: "-", service: "Crown Fitting", date: keyDaysAgo(3), time: "09:30", rawStatus: "completed" },
    { id: "apt-w7", patient: "Ava Thompson", phone: "-", service: "Cleaning", date: keyDaysAgo(3), time: "12:00", rawStatus: "completed" },
    { id: "apt-w8", patient: "Ethan Brooks", phone: "-", service: "Filling", date: keyDaysAgo(3), time: "14:45", rawStatus: "completed" },
    { id: "apt-w9", patient: "Isabella Martin", phone: "-", service: "Root Canal", date: keyDaysAgo(4), time: "09:00", rawStatus: "completed" },
    { id: "apt-w10", patient: "Lucas Bianchi", phone: "-", service: "Consultation", date: keyDaysAgo(4), time: "11:30", rawStatus: "completed" },
    { id: "apt-w11", patient: "Mia Alvarez", phone: "-", service: "Cleaning", date: keyDaysAgo(5), time: "10:15", rawStatus: "completed" },
    { id: "apt-w12", patient: "Benjamin Clarke", phone: "-", service: "Whitening", date: keyDaysAgo(5), time: "13:00", rawStatus: "completed" },
    { id: "apt-w13", patient: "Chloe Dubois", phone: "-", service: "Filling", date: keyDaysAgo(5), time: "15:00", rawStatus: "completed" },
    { id: "apt-w14", patient: "Henry Walsh", phone: "-", service: "Crown Fitting", date: keyDaysAgo(6), time: "09:45", rawStatus: "completed" },
];

// Attach today's startTime values from time strings (used for the "upcoming this week" calc).
const now = new Date();
MOCK_APPOINTMENTS.forEach((a) => {
    if (a.date === todayKeyStatic && !a.startTime) {
        const [h, m] = a.time.split(":").map(Number);
        const d = new Date(now);
        d.setHours(h, m, 0, 0);
        a.startTime = d.toISOString();
    }
});

const MOCK_RECENT_PATIENTS: RecentPatient[] = [
    { id: "pat-1", name: "Emily Carter", lastVisit: "Jul 29", treatment: "Root Canal" },
    { id: "pat-2", name: "James Whitfield", lastVisit: "Jul 29", treatment: "Routine Cleaning" },
    { id: "pat-3", name: "Priya Nandakumar", lastVisit: "Jul 29", treatment: "Cavity Filling" },
    { id: "pat-10", name: "Liam Novak", lastVisit: "Jul 27", treatment: "Teeth Whitening" },
    { id: "pat-11", name: "Sofia Reyes", lastVisit: "Jul 25", treatment: "Wisdom Tooth Extraction" },
    { id: "pat-12", name: "Noah Fischer", lastVisit: "Jul 22", treatment: "Crown Fitting" },
];

const MOCK_ACTIVE_PATIENT_COUNT = 42;

// ------------------------------------------------------------------------

export default function DoctorDashboardTab({
    onNavigate,
}: {
    onNavigate?: (tab: "schedule" | "patients" | "availability" | "settings") => void;
}) {
    const [doctorName] = useState<string>(MOCK_DOCTOR_NAME);
    const [appointments] = useState<AppointmentLite[]>(MOCK_APPOINTMENTS);
    const [recentPatients] = useState<RecentPatient[]>(MOCK_RECENT_PATIENTS);
    const [activePatientCount] = useState<number>(MOCK_ACTIVE_PATIENT_COUNT);

    const todayKey = toDateKey(new Date());
    const nowTime = new Date().toTimeString().slice(0, 5);

    const todaysAppointments = useMemo(
        () =>
            appointments
                .filter((a) => a.date === todayKey)
                .sort((a, b) => a.time.localeCompare(b.time)),
        [appointments, todayKey]
    );

    const completedTodayCount = todaysAppointments.filter(
        (a) => a.rawStatus === "completed"
    ).length;

    const upcomingThisWeekCount = useMemo(() => {
        const now = new Date();
        const weekAhead = new Date();
        weekAhead.setDate(now.getDate() + 7);
        return appointments.filter((a) => {
            if (!a.startTime) return false;
            const d = new Date(a.startTime);
            return (
                d >= now &&
                d <= weekAhead &&
                a.rawStatus !== "cancelled" &&
                a.rawStatus !== "completed" &&
                a.rawStatus !== "no_show"
            );
        }).length;
    }, [appointments]);

    const upNext = useMemo(() => {
        const remaining = todaysAppointments.filter(
            (a) =>
                a.rawStatus !== "completed" &&
                a.rawStatus !== "cancelled" &&
                a.rawStatus !== "no_show"
        );
        const notPastYet = remaining.filter((a) => a.time >= nowTime);
        return notPastYet[0] || remaining[0] || null;
    }, [todaysAppointments, nowTime]);

    const pendingFollowUps = useMemo(
        () => appointments.filter((a) => a.rawStatus === "completed" && !a.notes),
        [appointments]
    );

    const statusBreakdown = useMemo(() => {
        const counts: Record<string, number> = {
            Confirmed: 0,
            "Checked In": 0,
            Completed: 0,
            "No-Show": 0,
            Cancelled: 0,
        };
        todaysAppointments.forEach((a) => {
            if (a.rawStatus === "checked_in") counts["Checked In"]++;
            else if (a.rawStatus === "completed") counts["Completed"]++;
            else if (a.rawStatus === "no_show") counts["No-Show"]++;
            else if (a.rawStatus === "cancelled") counts["Cancelled"]++;
            else counts["Confirmed"]++;
        });
        return Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [todaysAppointments]);

    const weeklyTrend = useMemo(() => {
        const days: { label: string; key: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            const label = d.toLocaleDateString("en-US", { weekday: "short" });
            days.push({ label, key, count: 0 });
        }
        appointments.forEach((a) => {
            const match = days.find((d) => d.key === a.date);
            if (match) match.count++;
        });
        return days;
    }, [appointments]);

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    })();

    const firstName = doctorName.replace("Dr.", "").trim().split(" ")[0] || "Doctor";

    return (
        <div className="w-full py-6">
            <div className="space-y-6 w-full">
                <div>
                    <p className="text-sm text-slate-500">
                        {greeting}, Dr. {firstName}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Appointments Today
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/10 text-[#7da3b3]">
                                <CalendarCheck className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {todaysAppointments.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Completed Today
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{completedTodayCount}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Upcoming This Week
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
                                <CalendarClock className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{upcomingThisWeekCount}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Active Patients
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                <Users className="h-4 w-4" />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{activePatientCount}</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Weekly Trend */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/10 text-[#7da3b3]">
                                <TrendingUp className="h-4 w-4" />
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Your Appointments for Last 7 Days
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#f1f5f9" }}
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: "1px solid #e2e8f0",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Bar dataKey="count" name="Appointments" fill="#7da3b3" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
                                <PieChartIcon className="h-4 w-4" />
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Today's Status
                            </h3>
                        </div>
                        {statusBreakdown.length === 0 ? (
                            <div className="h-64 flex items-center justify-center text-xs text-slate-400 text-center px-4">
                                No appointments scheduled for today yet.
                            </div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={45}
                                            outerRadius={72}
                                            paddingAngle={3}
                                        >
                                            {statusBreakdown.map((entry) => (
                                                <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: "1px solid #e2e8f0",
                                                fontSize: 12,
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: 11, color: "#64748b" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* Up Next + Today's Schedule Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Up Next */}
                    <div className="rounded-2xl border border-[#7da3b3]/20 bg-gradient-to-br from-[#7da3b3]/10 via-white to-white p-6 shadow-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3] text-white">
                                <UserRoundCheck className="h-4 w-4" />
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Up Next
                            </h3>
                        </div>

                        {upNext ? (
                            <div>
                                <p className="text-lg font-bold text-slate-900">{upNext.patient}</p>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock className="h-3.5 w-3.5 text-[#7da3b3]" /> {upNext.time}
                                    <span className="text-slate-300">·</span>
                                    <Stethoscope className="h-3.5 w-3.5 text-[#7da3b3]" /> {upNext.service}
                                </p>
                                {upNext.phone && upNext.phone !== "-" && (
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {upNext.phone}
                                    </p>
                                )}
                                {upNext.notes ? (
                                    <div className="mt-3 rounded-xl border border-[#7da3b3]/20 bg-white/70 p-3">
                                        <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
                                            <StickyNote className="h-3 w-3" /> Notes
                                        </p>
                                        <p className="mt-1 text-xs text-slate-600">{upNext.notes}</p>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-xs italic text-slate-400">No notes for this visit.</p>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-xs text-slate-400">
                                No more patients scheduled for today.
                            </div>
                        )}
                    </div>

                    {/* Today's Schedule */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/10 text-[#7da3b3]">
                                    <Clock className="h-4 w-4" />
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Today's Schedule
                                </h3>
                            </div>
                            <button
                                onClick={() => onNavigate?.("schedule")}
                                className="flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
                            >
                                View all <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {todaysAppointments.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No appointments scheduled for today.
                                </div>
                            ) : (
                                todaysAppointments.map((a) => (
                                    <div key={a.id} className="flex items-center gap-3 p-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700 font-bold">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">
                                                {a.patient}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{a.service}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-semibold text-slate-700">{a.time}</p>
                                            <span
                                                className={`inline-block mt-0.5 rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${a.rawStatus === "completed"
                                                    ? "bg-slate-100 text-slate-600"
                                                    : a.rawStatus === "checked_in"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : a.rawStatus === "no_show"
                                                            ? "bg-rose-50 text-rose-600"
                                                            : a.rawStatus === "cancelled"
                                                                ? "bg-slate-100 text-slate-400"
                                                                : "bg-[#7da3b3]/10 text-[#3f6274]"
                                                    }`}
                                            >
                                                {a.rawStatus === "checked_in"
                                                    ? "Checked In"
                                                    : a.rawStatus === "completed"
                                                        ? "Completed"
                                                        : a.rawStatus === "no_show"
                                                            ? "No-Show"
                                                            : a.rawStatus === "cancelled"
                                                                ? "Cancelled"
                                                                : "Confirmed"}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Patients + Schedule Shortcut + Follow-ups Row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Recent Patients Seen */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
                                    <History className="h-4 w-4" />
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Recent Patients Seen
                                </h3>
                            </div>
                            <button
                                onClick={() => onNavigate?.("patients")}
                                className="flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
                            >
                                View all <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentPatients.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No recent patient visits yet.
                                </div>
                            ) : (
                                recentPatients.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => onNavigate?.("patients")}
                                        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50/60"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7da3b3]/10 text-[#3f6274] font-semibold text-xs">
                                            {p.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{p.treatment}</p>
                                        </div>
                                        <span className="shrink-0 text-xs text-slate-400">{p.lastVisit}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Availability shortcut + Pending follow-ups */}
                    <div className="space-y-4">
                        <button
                            onClick={() => onNavigate?.("availability")}
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-900/5 bg-white/90 p-5 text-left shadow-lg backdrop-blur-sm transition-colors hover:border-[#7da3b3]/30"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7da3b3]/10 text-[#7da3b3]">
                                    <CalendarClock className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Manage Availability
                                    </p>
                                    <p className="text-[0.7rem] text-slate-400">Update your working hours</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                        </button>


                    </div>
                </div>
            </div>
        </div>
    );
}