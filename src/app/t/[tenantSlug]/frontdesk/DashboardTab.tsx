"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
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
    Clock,
    UserCheck,
    AlertTriangle,
    Inbox,
    Stethoscope,
    TrendingUp,
    PieChart as PieChartIcon,
    UserPlus,
    ClipboardList,
    ArrowRight,
    Loader2,
    AlertCircle,
    User,
    Phone,
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
    phone: string;
    dentist: string;
    providerId?: string;
    service: string;
    date: string;
    time: string;
    rawStatus: string;
}

interface DoctorOption {
    id: string;
    name: string;
}

function formatDateTime(isoString: string | Date | null | undefined) {
    if (!isoString) return { date: "-", time: "-" };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: "-", time: "-" };
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
}

function toDateKey(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function DashboardTab({
    onNavigate,
}: {
    onNavigate?: (tab: "appointments" | "patients" | "availability" | "settings") => void;
}) {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [doctorsList, setDoctorsList] = useState<DoctorOption[]>([]);
    const [appointments, setAppointments] = useState<AppointmentLite[]>([]);
    const [pendingCount, setPendingCount] = useState(0);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMsg(null);

            let locationId: string | null = null;
            const [servicesRes, treatmentsRes, patientsRes] = await Promise.all([
                axios.get("/api/services").catch(() => null),
                axios.get("/api/treatment").catch(() => null),
                axios.get("/api/patent").catch(() => null),
            ]);

            if (servicesRes?.data?.success && servicesRes.data.data.services?.length > 0) {
                locationId = servicesRes.data.data.services[0].locationId;
            } else if (treatmentsRes?.data?.success && treatmentsRes.data.data.treatments?.length > 0) {
                locationId = treatmentsRes.data.data.treatments[0].locationId;
            } else if (patientsRes?.data?.success && patientsRes.data.data.patients?.length > 0) {
                locationId = patientsRes.data.data.patients[0].locationId;
            }

            const doctorsRes = await axios
                .get("/api/doctor", { params: locationId ? { locationId } : undefined })
                .catch(() => null);
            if (doctorsRes?.data?.success && doctorsRes.data.data.doctors) {
                setDoctorsList(
                    doctorsRes.data.data.doctors.map((d: any) => ({ id: d.id, name: d.name }))
                );
            }

            if (locationId) {
                const apptsRes = await axios
                    .get("/api/appoments", { params: { locationId } })
                    .catch(() => null);

                if (apptsRes?.data?.success && apptsRes.data.data.appointments) {
                    const mapped: AppointmentLite[] = apptsRes.data.data.appointments.map((a: any) => {
                        const { date, time } = formatDateTime(a.startTime);
                        return {
                            id: a.id,
                            patient: a.patientName || "Patient",
                            phone: a.patientPhone || "-",
                            dentist: a.providerName || "Unassigned",
                            providerId: a.providerId || "",
                            service: a.treatmentName || "General Treatment",
                            date,
                            time,
                            rawStatus: a.status || "confirmed",
                        };
                    });
                    setAppointments(mapped);
                }

                const pendingRes = await axios
                    .get("/api/appoments/pending", { params: { locationId } })
                    .catch(() => null);
                if (pendingRes?.data?.success && pendingRes.data.data.appointments) {
                    setPendingCount(pendingRes.data.data.appointments.length);
                }
            }
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setErrorMsg("Failed to load dashboard data from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const todayKey = toDateKey(new Date());

    const todaysAppointments = useMemo(
        () => appointments.filter((a) => a.date === todayKey).sort((a, b) => a.time.localeCompare(b.time)),
        [appointments, todayKey]
    );

    const checkedInCount = todaysAppointments.filter((a) => a.rawStatus === "checked_in").length;
    const noShowCount = todaysAppointments.filter((a) => a.rawStatus === "no_show").length;
    const completedCount = todaysAppointments.filter((a) => a.rawStatus === "completed").length;

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

    const doctorLoad = useMemo(() => {
        const counts = doctorsList.map((d) => ({
            id: d.id,
            name: d.name,
            count: todaysAppointments.filter((a) => a.providerId === d.id).length,
        }));
        const maxCount = Math.max(1, ...counts.map((c) => c.count));
        return counts
            .sort((a, b) => b.count - a.count)
            .map((c) => ({ ...c, pct: Math.round((c.count / maxCount) * 100) }));
    }, [doctorsList, todaysAppointments]);

    const upcomingToday = todaysAppointments.filter(
        (a) => a.rawStatus !== "completed" && a.rawStatus !== "cancelled" && a.rawStatus !== "no_show"
    );

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    })();

    const todayLabel = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="w-full py-6">
            <div className="space-y-6 w-full">
                {errorMsg && (
                    <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                            <span>{errorMsg}</span>
                        </div>
                    </div>
                )}



                {loading ? (
                    <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 shadow-lg backdrop-blur-sm">
                        <Loader2 className="h-6 w-6 animate-spin text-[#7da3b3]" />
                        <span>Loading dashboard...</span>
                    </div>
                ) : (
                    <>
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
                                        Pending Requests
                                    </p>
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                        <Inbox className="h-4 w-4" />
                                    </span>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{pendingCount}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Checked In
                                    </p>
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <UserCheck className="h-4 w-4" />
                                    </span>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{checkedInCount}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        No-Shows Today
                                    </p>
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                        <AlertTriangle className="h-4 w-4" />
                                    </span>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-900">{noShowCount}</p>
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
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Appointments for Last 7 Days
                                        </h3>

                                    </div>
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
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Today's Status
                                        </h3>

                                    </div>
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
                                                        <Cell
                                                            key={entry.name}
                                                            fill={STATUS_COLORS[entry.name] || "#94a3b8"}
                                                        />
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

                        {/* Schedule + Doctor Load Row */}
                        <div className="grid gap-4 lg:grid-cols-3">
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
                                        onClick={() => onNavigate?.("appointments")}
                                        className="flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
                                    >
                                        View all <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>

                                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                                    {upcomingToday.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-slate-400">
                                            No upcoming appointments left for today.
                                        </div>
                                    ) : (
                                        upcomingToday.map((a) => (
                                            <div key={a.id} className="flex items-center gap-3 p-4">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700 font-bold">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {a.patient}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                                                        <Stethoscope className="h-3 w-3 text-[#7da3b3]" /> {a.dentist} ·{" "}
                                                        {a.service}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-semibold text-slate-700">{a.time}</p>
                                                    <span
                                                        className={`inline-block mt-0.5 rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${a.rawStatus === "checked_in"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        {a.rawStatus === "checked_in" ? "Checked In" : "Confirmed"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Doctor Load Today */}
                            <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
                                        <Stethoscope className="h-4 w-4" />
                                    </span>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Doctor Load Today
                                    </h3>
                                </div>

                                {doctorLoad.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400">No doctors found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {doctorLoad.map((d) => (
                                            <div key={d.id}>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="font-semibold text-slate-700 truncate pr-2">
                                                        {d.name}
                                                    </span>
                                                    <span className="text-slate-400 font-medium shrink-0">
                                                        {d.count} appt{d.count === 1 ? "" : "s"}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-[#7da3b3] transition-all"
                                                        style={{ width: `${d.count > 0 ? Math.max(d.pct, 8) : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>


                    </>
                )}
            </div>
        </div>
    );
}