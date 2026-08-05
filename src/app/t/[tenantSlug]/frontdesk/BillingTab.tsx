"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Clock,
  User,
  Receipt,
  Banknote,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  Scale,
  Stethoscope,
  Syringe,
  HeartPulse,
  Cross,
  Pill,
  Activity,
  MapPin,
  ClipboardList,
  CalendarDays,
  Printer,
  X,
  Phone,
} from "lucide-react";

const OUTLETS = [
  { id: "all", name: "All outlets" },
  { id: "outlet-1", name: "Chitwan Dental Home - Bharatpur" },
  { id: "outlet-2", name: "Chitwan Dental Home - Narayangarh" },
];

const ENTRY_TYPES = ["charge", "payment", "adjustment"] as const;
type EntryType = (typeof ENTRY_TYPES)[number];

const PAYMENT_METHODS = ["Cash", "Card", "Wallet"];

const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  charge: "Charge",
  payment: "Payment",
  adjustment: "Adjustment",
};

const ENTRY_TYPE_COLORS: Record<EntryType, string> = {
  charge: "bg-amber-100 text-amber-700",
  payment: "bg-emerald-100 text-emerald-700",
  adjustment: "bg-violet-100 text-violet-700",
};

const ENTRY_TYPE_ICONS: Record<EntryType, typeof ArrowUpCircle> = {
  charge: ArrowUpCircle,
  payment: ArrowDownCircle,
  adjustment: Scale,
};

type LedgerEntry = {
  id: string;
  type: EntryType;
  amountCents: number;
  createdAt: string; // ISO
  appointmentId?: string;
  treatmentName?: string;
  method?: string; // local-only, not in schema yet
  note?: string; // local-only, not in schema yet
};

type PatientLedger = {
  patientId: string;
  patientName: string;
  phone: string;
  entries: LedgerEntry[];
};

const SEED_LEDGERS: PatientLedger[] = [
  {
    patientId: "p1",
    patientName: "Rita Adhikari",
    phone: "+977 981-1112223",
    entries: [
      {
        id: "e1",
        type: "charge",
        amountCents: 650000,
        createdAt: "2026-07-28T10:15:00",
        appointmentId: "apt-101",
        treatmentName: "Root Canal Treatment",
      },
      {
        id: "e2",
        type: "payment",
        amountCents: 400000,
        createdAt: "2026-07-28T10:20:00",
        method: "Cash",
      },
    ],
  },
  {
    patientId: "p2",
    patientName: "Suman Rai",
    phone: "+977 981-3334445",
    entries: [
      {
        id: "e3",
        type: "charge",
        amountCents: 150000,
        createdAt: "2026-07-30T09:00:00",
        appointmentId: "apt-102",
        treatmentName: "Dental Cleaning",
      },
      {
        id: "e4",
        type: "payment",
        amountCents: 150000,
        createdAt: "2026-07-30T09:10:00",
        method: "Card",
      },
    ],
  },
  {
    patientId: "p3",
    patientName: "Anjali Poudel",
    phone: "+977 981-5556667",
    entries: [
      {
        id: "e5",
        type: "charge",
        amountCents: 900000,
        createdAt: "2026-08-01T11:30:00",
        appointmentId: "apt-103",
        treatmentName: "Orthodontic Consultation",
      },
      {
        id: "e6",
        type: "adjustment",
        amountCents: -50000,
        createdAt: "2026-08-01T11:35:00",
        note: "Loyalty discount",
      },
    ],
  },
  {
    patientId: "p4",
    patientName: "Kiran Basnet",
    phone: "+977 981-7778889",
    entries: [
      {
        id: "e7",
        type: "charge",
        amountCents: 250000,
        createdAt: "2026-08-02T08:45:00",
        appointmentId: "apt-104",
        treatmentName: "Teeth Whitening",
      },
    ],
  },
];

const EMPTY_ENTRY_FORM = {
  type: "charge" as EntryType,
  amount: "",
  method: PAYMENT_METHODS[0],
  note: "",
};

type EntryFormState = typeof EMPTY_ENTRY_FORM;

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

const textareaClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

function centsToDisplay(cents: number) {
  const value = Number.isFinite(cents) ? cents : 0;
  return (value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function computeBalance(entries: LedgerEntry[]) {
  return entries.reduce((sum, e) => {
    if (e.type === "charge") return sum + e.amountCents;
    if (e.type === "payment") return sum - e.amountCents;
    return sum + e.amountCents; // adjustment: signed (negative = discount, positive = fee)
  }, 0);
}

function computeTotals(entries: LedgerEntry[]) {
  const charged = entries
    .filter((e) => e.type === "charge")
    .reduce((s, e) => s + e.amountCents, 0);
  const paid = entries
    .filter((e) => e.type === "payment")
    .reduce((s, e) => s + e.amountCents, 0);
  return { charged, paid };
}

// Running balance immediately after a given entry, based on all entries
// up to and including it (sorted chronologically).
function balanceAfterEntry(entries: LedgerEntry[], entryId: string) {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  let running = 0;
  for (const e of sorted) {
    if (e.type === "charge") running += e.amountCents;
    else if (e.type === "payment") running -= e.amountCents;
    else running += e.amountCents;
    if (e.id === entryId) break;
  }
  return running;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateOnly(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Placeholder receipt number derived from the entry id — once a real
// receiptNumber column/table exists on the backend, swap this out.
function receiptNumberFor(entryId: string) {
  const digits = entryId.replace(/\D/g, "");
  const suffix = (digits || entryId).slice(-4).padStart(4, "0");
  return `RCP-2026-${suffix}`;
}

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

const METHOD_ICONS: Record<string, typeof Banknote> = {
  Cash: Banknote,
  Card: CreditCard,
  Wallet: Smartphone,
  Insurance: ShieldCheck,
};

export default function BillingPage() {
  const [ledgers, setLedgers] = useState<PatientLedger[]>(SEED_LEDGERS);
  const [outletFilter, setOutletFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [balanceFilter, setBalanceFilter] = useState<"All" | "Due" | "Settled">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryTargetPatientId, setEntryTargetPatientId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState<EntryFormState>(EMPTY_ENTRY_FORM);

  const [receiptEntryId, setReceiptEntryId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return ledgers.map((l) => {
      const { charged, paid } = computeTotals(l.entries);
      const balance = computeBalance(l.entries);
      const lastActivity = l.entries.reduce(
        (latest, e) => (e.createdAt > latest ? e.createdAt : latest),
        l.entries[0]?.createdAt ?? ""
      );
      return { ...l, charged, paid, balance, lastActivity };
    });
  }, [ledgers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.patientName.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q);
      const matchesBalance =
        balanceFilter === "All" ||
        (balanceFilter === "Due" && r.balance > 0) ||
        (balanceFilter === "Settled" && r.balance <= 0);
      return matchesQuery && matchesBalance;
    });
  }, [rows, query, balanceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const selectedLedger = useMemo(
    () => ledgers.find((l) => l.patientId === selectedPatientId) ?? null,
    [ledgers, selectedPatientId]
  );

  // Ledger + entry currently shown in the receipt modal.
  // Searches every ledger's entries directly by id, so it doesn't depend
  // on selectedLedger being open at the same time.
  const receiptContext = useMemo(() => {
    if (!receiptEntryId) return null;
    for (const l of ledgers) {
      const entry = l.entries.find((e) => e.id === receiptEntryId);
      if (entry) return { ledger: l, entry };
    }
    return null;
  }, [ledgers, receiptEntryId]);

  const stats = useMemo(() => {
    const totalCharged = rows.reduce((s, r) => s + r.charged, 0);
    const totalPaid = rows.reduce((s, r) => s + r.paid, 0);
    const totalDue = rows.reduce((s, r) => s + Math.max(0, r.balance), 0);
    const patientsWithDue = rows.filter((r) => r.balance > 0).length;
    return [
      {
        icon: Receipt,
        label: "Total Charged",
        value: `NPR ${centsToDisplay(totalCharged)}`,
      },
      {
        icon: Wallet,
        label: "Total Collected",
        value: `NPR ${centsToDisplay(totalPaid)}`,
      },
      {
        icon: TrendingDown,
        label: "Outstanding Dues",
        value: `NPR ${centsToDisplay(totalDue)}`,
      },
      {
        icon: User,
        label: "Patients With Dues",
        value: String(patientsWithDue),
      },
    ];
  }, [rows]);

  function openEntryModal(patientId: string) {
    setEntryTargetPatientId(patientId);
    setEntryForm(EMPTY_ENTRY_FORM);
    setEntryModalOpen(true);
  }

  function update<K extends keyof EntryFormState>(key: K, value: EntryFormState[K]) {
    setEntryForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!entryTargetPatientId) return;

    const amountNumber = Number(entryForm.amount) || 0;
    let amountCents = Math.round(amountNumber * 100);

    // Payments and positive charges are stored as positive amounts.
    // Adjustments can be negative (discount) or positive (extra fee) —
    // for this static demo we treat a plain positive input as a discount
    // reduction by default, matching the most common front-desk use case.
    if (entryForm.type === "adjustment" && amountCents > 0) {
      amountCents = -amountCents;
    }

    const newEntry: LedgerEntry = {
      id: String(Date.now()),
      type: entryForm.type,
      amountCents:
        Math.abs(amountCents) *
        (entryForm.type === "adjustment" ? Math.sign(amountCents) || -1 : 1),
      createdAt: new Date().toISOString(),
      method: entryForm.type === "payment" ? entryForm.method : undefined,
      note: entryForm.note || undefined,
    };

    setLedgers((prev) =>
      prev.map((l) =>
        l.patientId === entryTargetPatientId
          ? { ...l, entries: [...l.entries, newEntry] }
          : l
      )
    );

    setEntryForm(EMPTY_ENTRY_FORM);
    setEntryModalOpen(false);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Stethoscope className="absolute -left-8 top-20 h-44 w-44 -rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Syringe className="absolute right-6 top-52 h-32 w-32 rotate-12 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <HeartPulse className="absolute left-[22%] bottom-32 h-28 w-28 -rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Cross className="absolute right-[10%] bottom-20 h-20 w-20 rotate-6 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Pill className="absolute left-[48%] top-8 h-16 w-16 rotate-45 text-[#7da3b3]/[0.07]" strokeWidth={1} />
        <Activity className="absolute right-[32%] bottom-[6%] h-24 w-24 text-[#7da3b3]/[0.07]" strokeWidth={1} />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10">
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm"
            >
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

        <div className="mt-10 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search patient, phone..."
                  className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={balanceFilter}
                  onChange={(e) => {
                    setBalanceFilter(e.target.value as "All" | "Due" | "Settled");
                    setCurrentPage(1);
                  }}
                  className="appearance-none rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-8 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
                >
                  <option value="All">All balances</option>
                  <option value="Due">Has dues</option>
                  <option value="Settled">Settled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-900/5">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[0.75rem] font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Last Activity</th>
                  <th className="px-5 py-3 font-medium">Charged</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                  <th className="px-5 py-3 font-medium">Balance</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/5 bg-white">
                {paginatedRows.map((r, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const hasDue = r.balance > 0;
                  return (
                    <tr
                      key={r.patientId}
                      onClick={() => setSelectedPatientId(r.patientId)}
                      className="cursor-pointer transition-colors hover:bg-[#7da3b3]/[0.06]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.8rem] font-semibold ${color}`}
                          >
                            {getInitials(r.patientName)}
                          </div>
                          <p className="truncate text-[0.9rem] font-semibold text-slate-900">
                            {r.patientName}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[0.85rem] text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                          {r.phone}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[0.85rem] text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                          {r.lastActivity ? formatDateTime(r.lastActivity) : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-[0.85rem] text-slate-700">
                        NPR {centsToDisplay(r.charged)}
                      </td>
                      <td className="px-5 py-4 text-[0.85rem] text-slate-700">
                        NPR {centsToDisplay(r.paid)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.78rem] font-medium ${
                            hasDue
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          NPR {centsToDisplay(Math.abs(r.balance))}
                          {hasDue ? " due" : r.balance < 0 ? " credit" : " settled"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEntryModal(r.patientId);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 px-3 py-1.5 text-[0.78rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                            Add Entry
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="bg-white py-16 text-center text-slate-500">
                      No patients match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-1 pt-4 text-xs">
              <span className="text-[0.7rem] text-slate-500 font-medium">
                Showing{" "}
                <strong className="text-slate-800">{startIndex + 1}</strong>{" "}
                to{" "}
                <strong className="text-slate-800">
                  {Math.min(startIndex + itemsPerPage, filtered.length)}
                </strong>{" "}
                of <strong className="text-slate-800">{filtered.length}</strong> patients
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
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ledger detail side panel */}
      {selectedLedger && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setSelectedPatientId(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedPatientId(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <button
                onClick={() => openEntryModal(selectedLedger.patientId)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-[0.85rem] font-medium text-white transition-colors hover:bg-[#345263]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add Entry
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Identity */}
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[1.3rem] font-semibold text-[#3f6274] ring-4 ring-white">
                  {getInitials(selectedLedger.patientName)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedLedger.patientName}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-[0.85rem] text-slate-500">
                    <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                    {selectedLedger.phone}
                  </p>

                  {(() => {
                    const balance = computeBalance(selectedLedger.entries);
                    const hasDue = balance > 0;
                    return (
                      <span
                        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-medium ${
                          hasDue
                            ? "bg-rose-100 text-rose-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        NPR {centsToDisplay(Math.abs(balance))}
                        {hasDue ? " due" : balance < 0 ? " credit" : " settled"}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {(() => {
                  const { charged, paid } = computeTotals(selectedLedger.entries);
                  return (
                    <>
                      <div className="rounded-2xl border border-slate-900/5 bg-white p-4 shadow-sm">
                        <p className="flex items-center gap-1.5 text-[0.78rem] text-slate-400">
                          <Receipt className="h-3.5 w-3.5" strokeWidth={2} />
                          Total Charged
                        </p>
                        <p className="mt-1 text-[1.1rem] font-semibold text-slate-800">
                          NPR {centsToDisplay(charged)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-900/5 bg-white p-4 shadow-sm">
                        <p className="flex items-center gap-1.5 text-[0.78rem] text-slate-400">
                          <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
                          Total Paid
                        </p>
                        <p className="mt-1 text-[1.1rem] font-semibold text-slate-800">
                          NPR {centsToDisplay(paid)}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Ledger history */}
              <div className="mt-6 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                  Ledger History
                </p>

                {selectedLedger.entries.length === 0 ? (
                  <p className="mt-4 text-[0.85rem] text-slate-500">No entries recorded yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {[...selectedLedger.entries]
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map((entry) => {
                        const TypeIcon = ENTRY_TYPE_ICONS[entry.type];
                        const MethodIcon = entry.method ? METHOD_ICONS[entry.method] : null;
                        const isNegativeAdjustment =
                          entry.type === "adjustment" && entry.amountCents < 0;
                        return (
                          <div
                            key={entry.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-slate-900/5 p-3"
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ENTRY_TYPE_COLORS[entry.type]}`}
                              >
                                <TypeIcon className="h-4 w-4" strokeWidth={2} />
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${ENTRY_TYPE_COLORS[entry.type]}`}
                                  >
                                    {ENTRY_TYPE_LABELS[entry.type]}
                                  </span>
                                  {entry.method && (
                                    <span className="inline-flex items-center gap-1 text-[0.75rem] text-slate-500">
                                      {MethodIcon && (
                                        <MethodIcon className="h-3 w-3" strokeWidth={2} />
                                      )}
                                      {entry.method}
                                    </span>
                                  )}
                                </div>
                                {entry.treatmentName && (
                                  <p className="mt-1 text-[0.82rem] text-slate-700">
                                    {entry.treatmentName}
                                  </p>
                                )}
                                {entry.note && (
                                  <p className="mt-1 text-[0.8rem] text-slate-500">{entry.note}</p>
                                )}
                                <p className="mt-1 flex items-center gap-1 text-[0.75rem] text-slate-400">
                                  <CalendarDays className="h-3 w-3" strokeWidth={2} />
                                  {formatDateTime(entry.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <p
                                className={`text-[0.9rem] font-semibold ${
                                  entry.type === "payment" || isNegativeAdjustment
                                    ? "text-emerald-600"
                                    : "text-slate-800"
                                }`}
                              >
                                {entry.type === "payment" || isNegativeAdjustment ? "−" : "+"}
                                NPR {centsToDisplay(Math.abs(entry.amountCents))}
                              </p>
                              {entry.type === "payment" && (
                                <button
                                  type="button"
                                  onClick={() => setReceiptEntryId(entry.id)}
                                  className="inline-flex items-center gap-1 rounded-full border border-slate-900/10 px-2.5 py-1 text-[0.72rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                  <Printer className="h-3 w-3" strokeWidth={2} />
                                  Receipt
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add ledger entry modal */}
      {entryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div
            onClick={() => setEntryModalOpen(false)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-[1.05rem] font-semibold text-slate-900">Add Ledger Entry</h3>
            <p className="mt-1 text-[0.8rem] text-slate-500">
              {ledgers.find((l) => l.patientId === entryTargetPatientId)?.patientName}
            </p>

            <form onSubmit={handleAddEntry} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                  Entry type
                </span>
                <select
                  value={entryForm.type}
                  onChange={(e) => update("type", e.target.value as EntryType)}
                  className={inputClass}
                >
                  {ENTRY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {ENTRY_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <Banknote className="h-3.5 w-3.5" strokeWidth={2} />
                  Amount (NPR)
                </span>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={entryForm.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  placeholder="1500"
                  className={inputClass}
                />
                {entryForm.type === "adjustment" && (
                  <p className="mt-1.5 text-[0.75rem] text-slate-400">
                    Treated as a discount (reduces balance). Use a negative-effect note to clarify.
                  </p>
                )}
              </label>

              {entryForm.type === "payment" && (
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <CreditCard className="h-3.5 w-3.5" strokeWidth={2} />
                    Payment method
                  </span>
                  <select
                    value={entryForm.method}
                    onChange={(e) => update("method", e.target.value)}
                    className={inputClass}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                  Note
                </span>
                <textarea
                  rows={2}
                  value={entryForm.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Optional reference or reason"
                  className={textareaClass}
                />
              </label>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-[#345263]"
                >
                  Add Entry
                </button>
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="rounded-full px-5 py-2.5 text-[0.9rem] font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {receiptEntryId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4 print-receipt-overlay">
          <div
            onClick={() => setReceiptEntryId(null)}
            className="absolute inset-0 print-hide"
            aria-hidden
          />

          <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl print-receipt-card">
            {/* Modal chrome — hidden on print */}
            <div className="print-hide flex items-center justify-between border-b border-slate-900/5 px-5 py-4">
              <h3 className="text-[0.95rem] font-semibold text-slate-900">Receipt</h3>
              <div className="flex items-center gap-2">
                {receiptContext && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-[0.82rem] font-medium text-white transition-colors hover:bg-[#345263]"
                  >
                    <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                    Print
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReceiptEntryId(null)}
                  aria-label="Close receipt"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Printable receipt content */}
            <div id="receipt-print-area" className="overflow-y-auto px-6 py-6">
              {!receiptContext ? (
                <div className="py-10 text-center text-[0.85rem] text-slate-500">
                  Couldn't find this payment entry. It may have been removed — close this
                  and try again from the ledger.
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[1.05rem] font-semibold text-[#345263]">
                        Chitwan Dental Home
                      </p>
                      <p className="mt-0.5 text-[0.78rem] text-slate-500">
                        {OUTLETS.find((o) => o.id !== "all")?.name ?? "Chitwan, Nepal"}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[#3f6274]">
                      <Receipt className="h-5 w-5" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-y border-dashed border-slate-300 py-3 text-[0.8rem]">
                    <span className="text-slate-500">Receipt No.</span>
                    <span className="font-medium text-slate-800">
                      {receiptNumberFor(receiptContext.entry.id)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-[0.85rem]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium text-slate-800">
                        {formatDateOnly(receiptContext.entry.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Patient</span>
                      <span className="font-medium text-slate-800">
                        {receiptContext.ledger.patientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phone</span>
                      <span className="font-medium text-slate-800">
                        {receiptContext.ledger.phone}
                      </span>
                    </div>
                    {receiptContext.entry.method && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Payment Method</span>
                        <span className="font-medium text-slate-800">
                          {receiptContext.entry.method}
                        </span>
                      </div>
                    )}
                    {receiptContext.entry.note && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Reference</span>
                        <span className="font-medium text-slate-800">
                          {receiptContext.entry.note}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.85rem] text-slate-600">Amount Paid</span>
                      <span className="text-[1.15rem] font-semibold text-slate-900">
                        NPR {centsToDisplay(receiptContext.entry.amountCents)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[0.8rem]">
                    <span className="text-slate-500">Balance After Payment</span>
                    {(() => {
                      const bal = balanceAfterEntry(
                        receiptContext.ledger.entries,
                        receiptContext.entry.id
                      );
                      const due = bal > 0;
                      return (
                        <span className={`font-medium ${due ? "text-rose-600" : "text-emerald-600"}`}>
                          NPR {centsToDisplay(Math.abs(bal))} {due ? "due" : "settled"}
                        </span>
                      );
                    })()}
                  </div>

                  <p className="mt-6 border-t border-dashed border-slate-300 pt-4 text-center text-[0.75rem] text-slate-400">
                    Thank you for visiting Chitwan Dental Home.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print-only styles: show just the receipt when printing */}
     <style jsx global>{`
@media print {
  body * {
    visibility: hidden;
  }

  #receipt-print-area,
  #receipt-print-area * {
    visibility: visible;
  }

  /*
   * The receipt modal's ancestors (fixed overlay + a max-h/overflow-hidden
   * card) stay in the render tree even though "visibility: hidden" is set
   * on them — their box, positioning and clipping still apply to visible
   * descendants. That was clipping the receipt content and causing the
   * fixed, full-viewport overlay to paginate oddly (blank / extra page).
   * Reset them to normal static flow just for print so the receipt can
   * render like an ordinary block of content on the page.
   */
  .print-receipt-overlay {
    position: static !important;
    inset: auto !important;
    background: none !important;
    padding: 0 !important;
    display: block !important;
  }

  .print-receipt-card {
    position: static !important;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  #receipt-print-area {
    position: static !important;
    overflow: visible !important;
    width: 100%;
    background: white;
    padding: 20px;
  }

  .print-hide {
    display: none !important;
  }

  @page {
    margin: 10mm;
  }
}
`}</style>
    </div>
  );
}