"use client";

import { useMemo, useState, useEffect } from "react";
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
  Search,
  Filter,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  Landmark,
  Building2,
  Stethoscope,
  Users,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  PieChart as PieChartIcon,
  BarChart3,
  AlertCircle,
  Phone,
  User,
  Cross,
  HeartPulse,
  Pill,
  Activity,
  Percent,
} from "lucide-react";



const OUTLETS = [
  { id: "all", name: "All outlets" },
  { id: "outlet-1", name: "Chitwan Dental Home - Bharatpur" },
  { id: "outlet-2", name: "Chitwan Dental Home - Narayangarh" },
];

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  Cash: "#7da3b3",
  Card: "#345263",
  Wallet: "#10b981",
 
};

const METHOD_ICONS: Record<string, typeof Banknote> = {
  Cash: Banknote,
  Card: CreditCard,
  Wallet: Smartphone,
 
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type OutletBilling = {
  outletId: string;
  outletName: string;
  chargedCents: number;
  collectedCents: number;
  patientsWithDues: number;
  doctors: { name: string; revenueCents: number }[];
  paymentBreakdown: { method: string; amountCents: number }[];
  weeklyCollectedNpr: number[]; // 7 values, Mon–Sun, plain NPR for chart readability
};

const OUTLET_BILLING: OutletBilling[] = [
  {
    outletId: "outlet-1",
    outletName: "Chitwan Dental Home - Bharatpur",
    chargedCents: 285_000_00 * 100,
    collectedCents: 214_000_00 * 100,
    patientsWithDues: 34,
    doctors: [
      { name: "Dr. Anish Shrestha", revenueCents: 98_000_00 * 100 },
      { name: "Dr. Priya Gurung", revenueCents: 76_000_00 * 100 },
      { name: "Dr. Bikash Thapa", revenueCents: 61_000_00 * 100 },
      { name: "Dr. Sunita Koirala", revenueCents: 50_000_00 * 100 },
    ],
    paymentBreakdown: [
      { method: "Cash", amountCents: 96_000_00 * 100 },
      { method: "Card", amountCents: 72_000_00 * 100 },
      { method: "Wallet", amountCents: 31_000_00 * 100 },

    ],
    weeklyCollectedNpr: [280000, 310000, 260000, 340000, 390000, 420000, 310000],
  },
  {
    outletId: "outlet-2",
    outletName: "Chitwan Dental Home - Narayangarh",
    chargedCents: 168_000_00 * 100,
    collectedCents: 132_000_00 * 100,
    patientsWithDues: 19,
    doctors: [
      { name: "Dr. Rajesh Malla", revenueCents: 71_000_00 * 100 },
      { name: "Dr. Manisha Rana", revenueCents: 61_000_00 * 100 },
    ],
    paymentBreakdown: [
      { method: "Cash", amountCents: 58_000_00 * 100 },
      { method: "Card", amountCents: 44_000_00 * 100 },
      { method: "Wallet", amountCents: 22_000_00 * 100 },

    ],
    weeklyCollectedNpr: [140000, 155000, 132000, 168000, 182000, 199000, 150000],
  },
];

type OutstandingPatient = {
  id: string;
  name: string;
  phone: string;
  outletId: string;
  chargedCents: number;
  paidCents: number;
  lastVisit: string; // display-ready label
};

const TOP_OUTSTANDING_PATIENTS: OutstandingPatient[] = [
  { id: "op1", name: "Rita Adhikari", phone: "+977 981-1112223", outletId: "outlet-1", chargedCents: 650000_00, paidCents: 400000_00, lastVisit: "Jul 28, 2026" },
  { id: "op2", name: "Anjali Poudel", phone: "+977 981-5556667", outletId: "outlet-1", chargedCents: 1500000_00, paidCents: 650000_00, lastVisit: "Aug 1, 2026" },
  { id: "op3", name: "Kiran Basnet", phone: "+977 981-7778889", outletId: "outlet-1", chargedCents: 150000_00, paidCents: 150000_00, lastVisit: "Aug 2, 2026" },
  { id: "op4", name: "Sabin Lama", phone: "+977 982-2223334", outletId: "outlet-1", chargedCents: 900000_00, paidCents: 0, lastVisit: "Jul 25, 2026" },
  { id: "op5", name: "Namrata Sharma", phone: "+977 982-4445556", outletId: "outlet-1", chargedCents: 250000_00, paidCents: 0, lastVisit: "Jul 30, 2026" },
  { id: "op6", name: "Bishal Karki", phone: "+977 984-1122334", outletId: "outlet-2", chargedCents: 360000_00, paidCents: 0, lastVisit: "Jul 27, 2026" },
  { id: "op7", name: "Sarita Gurung", phone: "+977 984-5566778", outletId: "outlet-2", chargedCents: 145000_00, paidCents: 0, lastVisit: "Aug 1, 2026" },
  { id: "op8", name: "Deepak Rai", phone: "+977 985-8899001", outletId: "outlet-2", chargedCents: 220000_00, paidCents: 0, lastVisit: "Jul 29, 2026" },
];

/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

function centsToDisplay(cents: number) {
  const value = Number.isFinite(cents) ? cents : 0;
  return (value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

const LIST_GRID = "grid grid-cols-[1.8fr_1.1fr_1fr_0.9fr_0.9fr_0.9fr_1fr] items-center gap-4";

export default function ManagerBillingPage() {
  const [outletFilter, setOutletFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [outletsList, setOutletsList] = useState(OUTLETS);
  const [outstandingPatientsList, setOutstandingPatientsList] = useState<OutstandingPatient[]>(TOP_OUTSTANDING_PATIENTS);

  useEffect(() => {
    async function fetchAdminBillingData() {
      try {
        const [outletsRes, patientsRes, doctorsRes] = await Promise.all([
          axios.get("/api/outlets").catch(() => null),
          axios.get("/api/patent").catch(() => null),
          axios.get("/api/doctor").catch(() => null),
        ]);
        if (outletsRes?.data?.success && Array.isArray(outletsRes.data.data.outlets)) {
          const apiOutlets = outletsRes.data.data.outlets;
          if (apiOutlets.length > 0) {
            setOutletsList([
              { id: "all", name: "All outlets" },
              ...apiOutlets.map((o: any) => ({ id: o.id, name: o.name || o.locationName || "Outlet" })),
            ]);
          }
        }
        if (patientsRes?.data?.success && Array.isArray(patientsRes.data.data.patients)) {
          const apiPatients = patientsRes.data.data.patients;
          if (apiPatients.length > 0) {
            const mappedPatients: OutstandingPatient[] = apiPatients.map((p: any) => ({
              id: p.id,
              name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
              phone: p.phone || "-",
              outletId: p.locationId || "outlet-1",
              chargedCents: 650000_00,
              paidCents: 400000_00,
              lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            }));
            setOutstandingPatientsList(mappedPatients);
          }
        }
      } catch (err) {
      }
    }
    fetchAdminBillingData();
  }, []);

  const activeOutlets = useMemo(
    () =>
      outletFilter === "all"
        ? OUTLET_BILLING
        : OUTLET_BILLING.filter((o) => o.outletId === outletFilter),
    [outletFilter]
  );

  // Aggregate totals across whatever outlets are currently in view.
  const totals = useMemo(() => {
    const chargedCents = activeOutlets.reduce((s, o) => s + o.chargedCents, 0);
    const collectedCents = activeOutlets.reduce((s, o) => s + o.collectedCents, 0);
    const outstandingCents = chargedCents - collectedCents;
    const patientsWithDues = activeOutlets.reduce((s, o) => s + o.patientsWithDues, 0);
    const collectionRate = chargedCents > 0 ? (collectedCents / chargedCents) * 100 : 0;
    return { chargedCents, collectedCents, outstandingCents, patientsWithDues, collectionRate };
  }, [activeOutlets]);

  const [collectionTimeframe, setCollectionTimeframe] = useState<"7days" | "20days" | "1year">("7days");

  const weeklyTrend = useMemo(() => {
    if (collectionTimeframe === "20days") {
      return [
        { label: "Day 1-5", collected: activeOutlets.reduce((s, o) => s + Math.round(o.weeklyCollectedNpr.reduce((a, b) => a + b, 0) * 0.7), 0) },
        { label: "Day 6-10", collected: activeOutlets.reduce((s, o) => s + Math.round(o.weeklyCollectedNpr.reduce((a, b) => a + b, 0) * 0.95), 0) },
        { label: "Day 11-15", collected: activeOutlets.reduce((s, o) => s + Math.round(o.weeklyCollectedNpr.reduce((a, b) => a + b, 0) * 1.1), 0) },
        { label: "Day 16-20", collected: activeOutlets.reduce((s, o) => s + Math.round(o.weeklyCollectedNpr.reduce((a, b) => a + b, 0) * 1.25), 0) },
      ];
    }
    if (collectionTimeframe === "1year") {
      return [
        { label: "Jan", collected: 1250000 },
        { label: "Feb", collected: 1400000 },
        { label: "Mar", collected: 1350000 },
        { label: "Apr", collected: 1600000 },
        { label: "May", collected: 1750000 },
        { label: "Jun", collected: 1550000 },
        { label: "Jul", collected: 1900000 },
        { label: "Aug", collected: 1820000 },
        { label: "Sep", collected: 1700000 },
        { label: "Oct", collected: 1850000 },
        { label: "Nov", collected: 1650000 },
        { label: "Dec", collected: 2100000 },
      ];
    }
    return WEEKDAY_LABELS.map((label, i) => ({
      label,
      collected: activeOutlets.reduce((s, o) => s + (o.weeklyCollectedNpr[i] ?? 0), 0),
    }));
  }, [activeOutlets, collectionTimeframe]);

  const paymentBreakdown = useMemo(() => {
    const totalsByMethod: Record<string, number> = {};
    activeOutlets.forEach((o) =>
      o.paymentBreakdown.forEach((p) => {
        totalsByMethod[p.method] = (totalsByMethod[p.method] || 0) + p.amountCents;
      })
    );
    return Object.entries(totalsByMethod).map(([method, amountCents]) => ({
      method,
      amountCents,
    }));
  }, [activeOutlets]);

  const doctorRevenue = useMemo(() => {
    const combined: { name: string; revenueCents: number }[] = [];
    activeOutlets.forEach((o) => combined.push(...o.doctors));
    const maxRevenue = Math.max(1, ...combined.map((d) => d.revenueCents));
    return combined
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .map((d) => ({ ...d, pct: Math.round((d.revenueCents / maxRevenue) * 100) }));
  }, [activeOutlets]);

  const filteredOutstanding = useMemo(() => {
    const q = query.trim().toLowerCase();
    return outstandingPatientsList.filter((p) => {
      const matchesOutlet = outletFilter === "all" || p.outletId === outletFilter;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q);
      return matchesOutlet && matchesQuery;
    }).sort((a, b) => (b.chargedCents - b.paidCents) - (a.chargedCents - a.paidCents));
  }, [outletFilter, query, outstandingPatientsList]);

  const totalPages = Math.max(1, Math.ceil(filteredOutstanding.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOutstanding = filteredOutstanding.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const stats = [
    {
      icon: Receipt,
      label: "Total Revenue",
      value: `NPR ${centsToDisplay(totals.chargedCents)}`,
    },
    {
      icon: Wallet,
      label: "Total Collected",
      value: `NPR ${centsToDisplay(totals.collectedCents)}`,
    },
    {
      icon: TrendingDown,
      label: "Outstanding Dues",
      value: `NPR ${centsToDisplay(totals.outstandingCents)}`,
    },
    {
      icon: Percent,
      label: "Collection Rate",
      value: `${totals.collectionRate.toFixed(1)}%`,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Landmark className="absolute -left-8 top-20 h-44 w-44 -rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Wallet className="absolute right-6 top-52 h-32 w-32 rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <HeartPulse className="absolute left-[22%] bottom-32 h-28 w-28 -rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Cross className="absolute right-[10%] bottom-20 h-20 w-20 rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <CreditCard className="absolute left-[48%] top-8 h-16 w-16 rotate-45 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Activity className="absolute right-[32%] bottom-[6%] h-24 w-24 text-[#7da3b3]/[0.07]" strokeWidth={1} />
      </div>

      <div className="sticky top-0 z-20 w-full bg-white px-6 py-6 lg:px-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl">
          Billing Overview
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <select
              value={outletFilter}
              onChange={(e) => {
                setOutletFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-10 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#7da3b3]"
            >
              {outletsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
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
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7da3b3]/10 text-[#7da3b3]">
                  <BarChart3 className="h-4 w-4" strokeWidth={2} />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Collections — {collectionTimeframe === "7days" ? "Last 7 Days" : collectionTimeframe === "20days" ? "Last 20 Days" : "Last 1 Year"}
                </h3>
              </div>
              <select
                value={collectionTimeframe}
                onChange={(e) => setCollectionTimeframe(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-[#7da3b3]"
              >
                <option value="7days">7 Days</option>
                <option value="20days">20 Days</option>
                <option value="1year">1 Year</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                <Tooltip
  cursor={{ fill: "#f1f5f9" }}
  formatter={(value) => {
    const amount = Number(value ?? 0);
    return [`NPR ${amount.toLocaleString()}`, "Collected"];
  }}
  contentStyle={{
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: 12,
  }}
/>
                  <Bar dataKey="collected" name="Collected" fill="#7da3b3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
                <PieChartIcon className="h-4 w-4" strokeWidth={2} />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Payment Method Mix
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    dataKey="amountCents"
                    nameKey="method"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {paymentBreakdown.map((entry) => (
                      <Cell
                        key={entry.method}
                        fill={PAYMENT_METHOD_COLORS[entry.method] || "#94a3b8"}
                      />
                    ))}
                  </Pie>
              <Tooltip
  formatter={(value) => {
    const amount = Number(value ?? 0);
    return `NPR ${centsToDisplay(amount)}`;
  }}
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
          </div>
        </div>

        {/* Revenue by doctor */}
        <div className="mt-8 rounded-2xl border border-slate-900/5 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#345263]/10 text-[#345263]">
              <Stethoscope className="h-4 w-4" strokeWidth={2} />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Revenue by Doctor
            </h3>
          </div>
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctorRevenue.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="truncate pr-2 font-semibold text-slate-700">{d.name}</span>
                  <span className="shrink-0 font-medium text-slate-400">
                    NPR {centsToDisplay(d.revenueCents)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#7da3b3] transition-all"
                    style={{ width: `${Math.max(d.pct, 8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top outstanding patients */}
        <div className="mt-8 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <TrendingUp className="h-4 w-4 rotate-180" strokeWidth={2} />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Top Outstanding Patients
              </h3>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search patient, phone..."
                className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.85rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-900/5">
            <div className={`${LIST_GRID} hidden bg-slate-50 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-wide text-slate-500 sm:grid`}>
              <span>Patient</span>
              <span>Phone</span>
              <span>Outlet</span>
              <span>Last Visit</span>
              <span>Charged</span>
              <span>Paid</span>
              <span>Balance</span>
            </div>

            <div className="divide-y divide-slate-900/5">
              {paginatedOutstanding.map((p, i) => {
                const outlet = OUTLET_BILLING.find((o) => o.outletId === p.outletId);
                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const balanceCents = p.chargedCents - p.paidCents;
                const isSettled = balanceCents <= 0;
                return (
                  <div
                    key={p.id}
                    className={`${LIST_GRID} flex-wrap gap-y-3 bg-white px-5 py-4 transition-colors hover:bg-[#7da3b3]/[0.06] max-sm:flex`}
                  >
                    <div className="flex min-w-[10rem] items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold ${color}`}>
                        {getInitials(p.name)}
                      </div>
                      <p className="truncate text-[0.9rem] font-semibold text-slate-900">{p.name}</p>
                    </div>
                    <div className="min-w-[8rem] text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {p.phone}
                      </p>
                    </div>
                    <div className="min-w-[8rem] text-[0.8rem] text-slate-600 truncate">
                      {outlet?.outletName.replace("Chitwan Dental Home - ", "") ?? "—"}
                    </div>
                    <div className="min-w-[6rem] text-[0.85rem] text-slate-600">{p.lastVisit}</div>
                    <div className="min-w-[6rem] text-[0.85rem] text-slate-700">
                      NPR {centsToDisplay(p.chargedCents)}
                    </div>
                    <div className="min-w-[6rem] text-[0.85rem] text-slate-700">
                      NPR {centsToDisplay(p.paidCents)}
                    </div>
                    <div className="min-w-[7rem]">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${
                          isSettled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {isSettled
                          ? "NPR 0 settled"
                          : `NPR ${centsToDisplay(balanceCents)} due`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredOutstanding.length === 0 && (
                <div className="bg-white py-16 text-center text-slate-500">
                  No outstanding balances match your filters.
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {filteredOutstanding.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-1 pt-4 text-xs">
              <span className="text-[0.7rem] font-medium text-slate-500">
                Showing{" "}
                <strong className="text-slate-800">{startIndex + 1}</strong> to{" "}
                <strong className="text-slate-800">
                  {Math.min(startIndex + itemsPerPage, filteredOutstanding.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{filteredOutstanding.length}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
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
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}