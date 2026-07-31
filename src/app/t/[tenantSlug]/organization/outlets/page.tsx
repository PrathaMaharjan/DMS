"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  SquarePen,
  IdCard,
  Clock,
  Phone,
  Mail,
  User,
  Trash2,
  Stethoscope,
  Syringe,
  HeartPulse,
  Cross,
  Pill,
  Activity,
  ClipboardList,
  BadgeCheck,
  Building,
  Globe,
} from "lucide-react";

const STATUSES = ["Active", "Inactive"] as const;
type OutletStatus = (typeof STATUSES)[number];

const STATUS_COLORS: Record<OutletStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};

type Outlet = {
  id: string;
  outletId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  manager: string;
  status: OutletStatus;
  openingTime: string;
  closingTime: string;
  createdDate: string;
  notes?: string;
};

const SEED_OUTLETS: Outlet[] = [
  {
    id: "1",
    outletId: "OUT-1001",
    name: "Chitwan Dental Home - Bharatpur",
    address: "Narayangarh Road, Bharatpur-10",
    city: "Chitwan",
    phone: "+977 56-123456",
    email: "bharatpur@chitwandental.com",
    manager: "Sujata Karki",
    status: "Active",
    openingTime: "09:00",
    closingTime: "18:00",
    createdDate: "2023-01-15",
    notes: "Main branch with full dental services.",
  },
  {
    id: "2",
    outletId: "OUT-1002",
    name: "Chitwan Dental Home - Narayangarh",
    address: "Ratna Chowk, Narayangarh-4",
    city: "Chitwan",
    phone: "+977 56-654321",
    email: "narayangarh@chitwandental.com",
    manager: "Dr. Anish Shrestha",
    status: "Active",
    openingTime: "10:00",
    closingTime: "19:00",
    createdDate: "2024-03-22",
    notes: "Newer branch, focused on cosmetic dentistry.",
  },
  {
    id: "3",
    outletId: "OUT-1003",
    name: "Chitwan Dental Home - Ratnanagar",
    address: "Ratnanagar-2, Chitwan",
    city: "Chitwan",
    phone: "+977 56-789012",
    email: "ratnanagar@chitwandental.com",
    manager: "Bimala Thapa",
    status: "Inactive",
    openingTime: "09:00",
    closingTime: "17:00",
    createdDate: "2022-07-05",
    notes: "Temporarily closed for renovation.",
  },
];

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  manager: "",
  status: "Active" as OutletStatus,
  openingTime: "09:00",
  closingTime: "18:00",
  notes: "",
};

type FormState = typeof EMPTY_FORM;

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

const textareaClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

function outletToForm(o: Outlet): FormState {
  return {
    name: o.name,
    address: o.address,
    city: o.city,
    phone: o.phone,
    email: o.email,
    manager: o.manager,
    status: o.status,
    openingTime: o.openingTime,
    closingTime: o.closingTime,
    notes: o.notes ?? "",
  };
}

function formatTimeLabel(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

export default function OutletsPage() {
  const [outlets, setOutlets] = useState<Outlet[]>(SEED_OUTLETS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OutletStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Outlet | null>(null);

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(o: Outlet) {
    setModalMode("edit");
    setEditingId(o.id);
    setForm(outletToForm(o));
    setModalOpen(true);
  }

  function openProfile(o: Outlet) {
    setSelectedOutlet(o);
  }

  function requestDelete(o: Outlet) {
    setDeleteTarget(o);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setOutlets((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setSelectedOutlet((prev) => (prev?.id === deleteTarget.id ? null : prev));
    setDeleteTarget(null);
  }

  function toggleStatus(o: Outlet) {
  setOutlets((prev) =>
    prev.map((x) =>
      x.id === o.id
        ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" }
        : x
    )
  );
  setSelectedOutlet((prev) =>
    prev && prev.id === o.id
      ? { ...prev, status: prev.status === "Active" ? "Inactive" : "Active" }
      : prev
  );
}

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (modalMode === "edit" && editingId) {
      setOutlets((prev) =>
        prev.map((o) => (o.id === editingId ? { ...o, ...form } : o))
      );
      setSelectedOutlet((prev) =>
        prev && prev.id === editingId ? { ...prev, ...form } : prev
      );
    } else {
      const newOutlet: Outlet = {
        id: String(Date.now()),
        outletId: `OUT-${1000 + outlets.length + 1}`,
        createdDate: new Date().toISOString().slice(0, 10),
        ...form,
      };
      setOutlets((prev) => [newOutlet, ...prev]);
      setCurrentPage(1);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return outlets.filter((o) => {
      const matchesQuery =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.manager.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [outlets, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOutlets = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const stats = useMemo(() => {
    const active = outlets.filter((o) => o.status === "Active").length;
    const cities = new Set(outlets.map((o) => o.city)).size;
    return [
      { icon: Building2, label: "Total Outlets", value: String(outlets.length) },
      { icon: BadgeCheck, label: "Active Outlets", value: String(active) },
      { icon: Globe, label: "Cities Covered", value: String(cities) },
    ];
  }, [outlets]);

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

      <div className="sticky top-0 z-20 w-full bg-white px-6 py-6 lg:px-10">
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl">
          Outlets
        </h1>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10">
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
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
                  placeholder="Search outlets..."
                  className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as "All" | OutletStatus);
                    setCurrentPage(1);
                  }}
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
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 rounded-full bg-[#749fb1] px-5 py-2.5 text-[0.9rem] font-medium text-white shadow-sm transition-colors hover:bg-[#345263]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Outlet
            </button>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-900/5">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[0.75rem] font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Outlet</th>
                  <th className="px-5 py-3 font-medium">Address</th>
                  <th className="px-5 py-3 font-medium">Manager</th>
                  <th className="px-5 py-3 font-medium">Hours</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/5 bg-white">
                {paginatedOutlets.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => openProfile(o)}
                    className="cursor-pointer transition-colors hover:bg-[#7da3b3]/[0.06]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-[0.9rem] font-semibold text-slate-900">{o.name}</p>

                    </td>
                    <td className="px-5 py-4 text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
                        <span>
                          {o.address}, {o.city}
                        </span>
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {o.manager}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[0.85rem] text-slate-600">
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        {formatTimeLabel(o.openingTime)} - {formatTimeLabel(o.closingTime)}
                      </p>
                    </td>
                 <td className="px-5 py-4">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      toggleStatus(o);
    }}
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-medium transition-opacity hover:opacity-80 ${STATUS_COLORS[o.status]}`}
  >
    {o.status}
  </button>
</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(o);
                          }}
                          aria-label="Edit outlet"
                          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <SquarePen className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestDelete(o);
                          }}
                          aria-label="Delete outlet"
                          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="bg-white py-16 text-center text-slate-500">
                      No outlets match your filters.
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
                of <strong className="text-slate-800">{filtered.length}</strong> outlets
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
                    className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${currentPage === pageNum
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

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0"
            aria-hidden
          />
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
                {modalMode === "edit" ? "Edit Outlet" : "Add Outlet"}
              </h2>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Building className="h-3.5 w-3.5" strokeWidth={2} />
                    Outlet name
                  </span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Chitwan Dental Home - Bharatpur"
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                      Address
                    </span>
                    <input
                      required
                      type="text"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                      City
                    </span>
                    <input
                      required
                      type="text"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                      Phone
                    </span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      Manager
                    </span>
                    <input
                      required
                      type="text"
                      value={form.manager}
                      onChange={(e) => update("manager", e.target.value)}
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
                      onChange={(e) => update("status", e.target.value as OutletStatus)}
                      className={inputClass}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      Opening time
                    </span>
                    <input
                      type="time"
                      value={form.openingTime}
                      onChange={(e) => update("openingTime", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      Closing time
                    </span>
                    <input
                      type="time"
                      value={form.closingTime}
                      onChange={(e) => update("closingTime", e.target.value)}
                      className={inputClass}
                    />
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
                    className={textareaClass}
                  />
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-[#345263]"
                  >
                    {modalMode === "edit" ? "Save Changes" : "Add Outlet"}
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

      {/* Outlet detail side panel */}
      {selectedOutlet && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setSelectedOutlet(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedOutlet(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <button
                onClick={() => requestDelete(selectedOutlet)}
                aria-label="Delete outlet"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-rose-500 transition-colors hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Delete
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[#3f6274] ring-4 ring-white">
                  <Building2 className="h-8 w-8" strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedOutlet.name}</h2>
                 <button
                    type="button"
                    onClick={() => toggleStatus(selectedOutlet)}
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-medium transition-opacity hover:opacity-80 ${STATUS_COLORS[selectedOutlet.status]}`}
                  >
                    {selectedOutlet.status}
                  </button>

                  <div className="mt-3 space-y-1 text-[0.85rem] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedOutlet.address}, {selectedOutlet.city}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedOutlet.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedOutlet.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                  Outlet Information
                </p>
                <div className="mt-4 grid grid-cols-2 gap-y-4 text-[0.85rem]">
                  <div>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                      Outlet ID
                    </p>
                    <p className="mt-1 font-medium text-slate-800">{selectedOutlet.outletId}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      Manager
                    </p>
                    <p className="mt-1 font-medium text-slate-800">{selectedOutlet.manager}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      Operating Hours
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatTimeLabel(selectedOutlet.openingTime)} - {formatTimeLabel(selectedOutlet.closingTime)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                      Created Date
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatDateLabel(selectedOutlet.createdDate)}
                    </p>
                  </div>
                </div>

                {selectedOutlet.notes && (
                  <div className="mt-6 border-t border-slate-900/5 pt-5">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      Notes
                    </p>
                    <p className="mt-3 text-[0.85rem] leading-relaxed text-slate-600">
                      {selectedOutlet.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
          <div
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <h3 className="mt-4 text-[1.05rem] font-semibold text-slate-900">
              Do you want to remove {deleteTarget.name}?
            </h3>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-rose-500 px-4 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-rose-600"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-slate-900/10 px-4 py-2.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:bg-slate-50"
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