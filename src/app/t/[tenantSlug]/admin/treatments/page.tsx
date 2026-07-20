"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Search,
  Plus,
  Stethoscope,
  CalendarCheck,
  TrendingUp,
  TrendingDown,
  ImagePlus,
  Syringe,
  HeartPulse,
  Cross,
  Pill,
  Activity,
  Filter,
  ChevronLeft,
  SquarePen,
  IdCard,
  Clock,
  Layers,
  Sparkles,
  ShieldCheck,
  Scissors,
  Banknote,
  Timer,
  ClipboardList,
  ListChecks,
  Tag,
  Trash2,
} from "lucide-react";

const CATEGORIES = [
  "Preventive",
  "Restorative",
  "Cosmetic",
  "Orthodontic",
  "Surgical",
  "Pediatric",
];

const ANESTHESIA_OPTIONS = ["None", "Local", "Sedation", "General"];

const CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  Preventive: ShieldCheck,
  Restorative: Layers,
  Cosmetic: Sparkles,
  Orthodontic: Activity,
  Surgical: Scissors,
  Pediatric: HeartPulse,
};

const CATEGORY_COLORS: Record<string, string> = {
  Preventive: "bg-emerald-100 text-emerald-700",
  Restorative: "bg-sky-100 text-sky-700",
  Cosmetic: "bg-violet-100 text-violet-700",
  Orthodontic: "bg-amber-100 text-amber-700",
  Surgical: "bg-rose-100 text-rose-700",
  Pediatric: "bg-teal-100 text-teal-700",
};

type Treatment = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  imageUrl?: string;
  treatmentId?: string;
  sessions?: string;
  recoveryTime?: string;
  anesthesia?: string;
  createdDate?: string;
  procedureSteps?: string[];
  aftercare?: string[];
};

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  duration: "",
  price: "",
  description: "",
  imageUrl: "",
  sessions: "",
  recoveryTime: "",
  anesthesia: ANESTHESIA_OPTIONS[0],
  procedureSteps: "",
  aftercare: "",
};

type FormState = typeof EMPTY_FORM;

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

const textareaClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

function treatmentToForm(t: Treatment): FormState {
  return {
    name: t.name,
    category: t.category,
    duration: t.duration,
    price: String(t.price),
    description: t.description,
    imageUrl: t.imageUrl ?? "",
    sessions: t.sessions ?? "",
    recoveryTime: t.recoveryTime ?? "",
    anesthesia: t.anesthesia ?? ANESTHESIA_OPTIONS[0],
    procedureSteps: (t.procedureSteps ?? []).join("\n"),
    aftercare: (t.aftercare ?? []).join("\n"),
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Treatment | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [profileTab, setProfileTab] = useState<"detail" | "procedure" | "aftercare">(
    "detail"
  );

  async function loadData() {
    try {
      setLoading(true);
      // Fetch locations/services first to get locationId
      const servicesRes = await axios.get("/api/services");
      if (servicesRes.data?.success && servicesRes.data.data.services?.length > 0) {
        setLocationId(servicesRes.data.data.services[0].locationId);
      }

      // Fetch treatments
      const treatmentsRes = await axios.get("/api/treatment");
      if (treatmentsRes.data?.success) {
        const dbTreatments = treatmentsRes.data.data.treatments || [];
        const mapped = dbTreatments.map((t: any, index: number) => ({
          id: t.id,
          name: t.name,
          category: CATEGORIES.find(c => c.toLowerCase() === t.category) || t.category,
          duration: `${t.durationMinutes} mins`,
          price: t.priceCents / 100,
          description: t.description || "",
          imageUrl: undefined,
          treatmentId: `TRT-${1000 + index + 1}`,
          sessions: String(t.sessions || 1),
          recoveryTime: t.recoveryTime || "",
          anesthesia: t.anesthesia ? (t.anesthesia.charAt(0).toUpperCase() + t.anesthesia.slice(1)) : "None",
          procedureSteps: t.procedureSteps || [],
          aftercare: t.aftercareInstructions || [],
        }));
        setTreatments(mapped);
      }
    } catch (err) {
      console.error("Failed to load treatments data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openProfile(t: Treatment) {
    setSelectedTreatment(t);
    setProfileTab("detail");
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(t: Treatment) {
    setModalMode("edit");
    setEditingId(t.id);
    setForm(treatmentToForm(t));
    setModalOpen(true);
  }

  function requestDeleteTreatment(t: Treatment) {
    setDeleteTarget(t);
  }

  async function confirmDeleteTreatment() {
    if (!deleteTarget) return;
    const t = deleteTarget;

    setDeletingId(t.id);
    try {
      const res = await axios.delete(`/api/treatment/${t.id}`);
      if (res.data?.success) {
        setTreatments((prev) => prev.filter((x) => x.id !== t.id));
        setSelectedTreatment((prev) => (prev?.id === t.id ? null : prev));
      }
    } catch (err) {
      console.error("Error deleting treatment:", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || "Failed to delete treatment.");
      } else {
        alert("An unexpected error occurred while deleting.");
      }
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return treatments.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [treatments, query, categoryFilter]);

  const avgPrice = useMemo(() => {
    if (treatments.length === 0) return 0;
    return treatments.reduce((sum, t) => sum + t.price, 0) / treatments.length;
  }, [treatments]);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    update("imageUrl", url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { procedureSteps, aftercare, price, ...rest } = form;
    const procedureList = linesToArray(procedureSteps);
    const aftercareList = linesToArray(aftercare);
    const priceNumber = Number(price) || 0;

    const durationVal = parseInt(form.duration.replace(/\D/g, ""), 10) || 30;
    const priceVal = Math.round(priceNumber * 100);
    const sessionsVal = parseInt(form.sessions, 10) || 1;
    const anesthesiaVal = form.anesthesia.toLowerCase();

    try {
      if (modalMode === "edit" && editingId) {
        const payload = {
          name: form.name,
          category: form.category.toLowerCase(),
          durationMinutes: durationVal,
          priceCents: priceVal,
          sessions: sessionsVal,
          anesthesia: anesthesiaVal,
          recoveryTime: form.recoveryTime || null,
          description: form.description || null,
          procedureSteps: procedureList,
          aftercareInstructions: aftercareList,
        };

        const res = await axios.patch(`/api/treatment/${editingId}`, payload);
        if (res.data?.success) {
          const updatedTreatment = res.data.data.treatment;
          setTreatments((prev) =>
            prev.map((t) =>
              t.id === editingId
                ? {
                    ...t,
                    name: updatedTreatment.name,
                    category: CATEGORIES.find(c => c.toLowerCase() === updatedTreatment.category) || updatedTreatment.category,
                    duration: `${updatedTreatment.durationMinutes} mins`,
                    price: updatedTreatment.priceCents / 100,
                    description: updatedTreatment.description || "",
                    sessions: String(updatedTreatment.sessions || 1),
                    recoveryTime: updatedTreatment.recoveryTime || "",
                    anesthesia: updatedTreatment.anesthesia ? (updatedTreatment.anesthesia.charAt(0).toUpperCase() + updatedTreatment.anesthesia.slice(1)) : "None",
                    procedureSteps: updatedTreatment.procedureSteps || [],
                    aftercare: updatedTreatment.aftercareInstructions || [],
                  }
                : t
            )
          );

          setSelectedTreatment((prev) =>
            prev && prev.id === editingId
              ? {
                  ...prev,
                  name: updatedTreatment.name,
                  category: CATEGORIES.find(c => c.toLowerCase() === updatedTreatment.category) || updatedTreatment.category,
                  duration: `${updatedTreatment.durationMinutes} mins`,
                  price: updatedTreatment.priceCents / 100,
                  description: updatedTreatment.description || "",
                  sessions: String(updatedTreatment.sessions || 1),
                  recoveryTime: updatedTreatment.recoveryTime || "",
                  anesthesia: updatedTreatment.anesthesia ? (updatedTreatment.anesthesia.charAt(0).toUpperCase() + updatedTreatment.anesthesia.slice(1)) : "None",
                  procedureSteps: updatedTreatment.procedureSteps || [],
                  aftercare: updatedTreatment.aftercareInstructions || [],
                }
              : prev
          );
        }
      } else {
        if (!locationId) {
          alert("Could not determine location ID. Please configure services first.");
          return;
        }

        const payload = {
          locationId,
          name: form.name,
          category: form.category.toLowerCase(),
          durationMinutes: durationVal,
          priceCents: priceVal,
          sessions: sessionsVal,
          anesthesia: anesthesiaVal,
          recoveryTime: form.recoveryTime || null,
          description: form.description || null,
          procedureSteps: procedureList,
          aftercareInstructions: aftercareList,
        };

        const res = await axios.post("/api/treatment", payload);
        if (res.data?.success) {
          const newTreatment = res.data.data.treatment;
          setTreatments((prev) => [
            {
              id: newTreatment.id,
              treatmentId: `TRT-${1000 + prev.length + 1}`,
              createdDate: new Date(newTreatment.createdAt).toISOString().slice(0, 16).replace("T", " "),
              name: newTreatment.name,
              category: CATEGORIES.find(c => c.toLowerCase() === newTreatment.category) || newTreatment.category,
              duration: `${newTreatment.durationMinutes} mins`,
              price: newTreatment.priceCents / 100,
              description: newTreatment.description || "",
              imageUrl: undefined,
              sessions: String(newTreatment.sessions || 1),
              recoveryTime: newTreatment.recoveryTime || "",
              anesthesia: newTreatment.anesthesia ? (newTreatment.anesthesia.charAt(0).toUpperCase() + newTreatment.anesthesia.slice(1)) : "None",
              procedureSteps: newTreatment.procedureSteps || [],
              aftercare: newTreatment.aftercareInstructions || [],
            },
            ...prev,
          ]);
        }
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Error submitting treatment:", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || "An error occurred.");
      } else {
        alert("An error occurred.");
      }
    }
  }

  const stats = [
    {
      icon: Stethoscope,
      label: "Total Treatments",
      value: String(treatments.length),
      trend: "+1 this month",
      trendUp: true,
    },
    {
      icon: CalendarCheck,
      label: "Bookings Today",
      value: "22",
      trend: "Increased by 9%",
      trendUp: true,
    },
    {
      icon: Banknote,
      label: "Average Price",
      value: `NPR ${Math.round(avgPrice).toLocaleString()}`,
      trend: "Decreased by 2%",
      trendUp: false,
    },
  ];

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
          Treatments
        </h1>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10">
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((stat) => {
            const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown;
            return (
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
            );
          })}
        </div>


        <div className="mt-10 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search treatments..."
                  className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-8 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
                >
                  <option value="All">All categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
              Add Treatment
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-500">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#7da3b3]" />
                <p className="mt-4 text-[0.9rem]">Loading treatments...</p>
              </div>
            ) : (
              filtered.map((t) => {
                const CategoryIcon = CATEGORY_ICONS[t.category] ?? Sparkles;
                const color = CATEGORY_COLORS[t.category] ?? "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={t.id}
                    onClick={() => openProfile(t)}
                    className="group cursor-pointer rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#7da3b3]/30 hover:shadow-lg"
                  >
                    <div className="relative -m-6 mb-5">
                      {t.imageUrl ? (
                        <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                          <Image
                            src={t.imageUrl}
                            alt={t.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-44 w-full items-center justify-center rounded-t-2xl ${color}`}
                        >
                          <CategoryIcon className="h-14 w-14" strokeWidth={2} />
                        </div>
                      )}

                      <div className="absolute right-3 top-3 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(t);
                          }}
                          aria-label="Edit treatment"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
                        >
                          <SquarePen className="h-4 w-4 text-slate-600" strokeWidth={2} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestDeleteTreatment(t);
                          }}
                          disabled={deletingId === t.id}
                          aria-label="Delete treatment"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 text-slate-600" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-[1.02rem] font-semibold text-slate-900">{t.name}</p>

                    <span className="mt-2 inline-flex items-center rounded-full bg-[#7da3b3]/10 px-2.5 py-1 text-[0.75rem] font-medium text-[#3f6274]">
                      {t.category}
                    </span>

                    <div className="mt-3 flex items-center gap-1.5 text-[0.8rem] text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {t.duration}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-900/5 pt-4">
                      <div className="flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                        <span className="text-[0.85rem] font-medium text-slate-700">
                          NPR {t.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-slate-500">
                        {t.sessions ?? "1"} session{t.sessions === "1" ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-900/15 bg-white py-16 text-center text-slate-500">
                No treatments match your filters.
              </div>
            )}
          </div>
        </div>
      </div>


      {modalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setModalOpen(false)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setModalOpen(false)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <h2 className="text-[0.95rem] font-semibold text-slate-900">
                {modalMode === "edit" ? "Edit Treatment" : "Add Treatment"}
              </h2>
            </div>

            <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                  {form.imageUrl ? (
                    <Image
                      src={form.imageUrl}
                      alt="Treatment preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-6 w-6" strokeWidth={1.8} />
                  )}
                </div>
                <label className="cursor-pointer rounded-full border border-slate-900/10 px-4 py-2 text-[0.85rem] font-medium text-slate-700 transition-colors hover:bg-slate-50">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <Tag className="h-3.5 w-3.5" strokeWidth={2} />
                  Treatment name
                </span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Teeth Whitening"
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Layers className="h-3.5 w-3.5" strokeWidth={2} />
                    Category
                  </span>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Timer className="h-3.5 w-3.5" strokeWidth={2} />
                    Duration
                  </span>
                  <input
                    required
                    type="text"
                    value={form.duration}
                    onChange={(e) => update("duration", e.target.value)}
                    placeholder="45 mins"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Banknote className="h-3.5 w-3.5" strokeWidth={2} />
                    Price (NPR)
                  </span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="6500"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <ListChecks className="h-3.5 w-3.5" strokeWidth={2} />
                    Sessions
                  </span>
                  <input
                    type="text"
                    value={form.sessions}
                    onChange={(e) => update("sessions", e.target.value)}
                    placeholder="1"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Syringe className="h-3.5 w-3.5" strokeWidth={2} />
                    Anesthesia
                  </span>
                  <select
                    value={form.anesthesia}
                    onChange={(e) => update("anesthesia", e.target.value)}
                    className={inputClass}
                  >
                    {ANESTHESIA_OPTIONS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                    Recovery time
                  </span>
                  <input
                    type="text"
                    value={form.recoveryTime}
                    onChange={(e) => update("recoveryTime", e.target.value)}
                    placeholder="2-3 days"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                  Description
                </span>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Brief overview of what this treatment involves"
                  className={textareaClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <ListChecks className="h-3.5 w-3.5" strokeWidth={2} />
                  Procedure steps (one per line)
                </span>
                <textarea
                  rows={3}
                  value={form.procedureSteps}
                  onChange={(e) => update("procedureSteps", e.target.value)}
                  placeholder={"Shade assessment and gum protection\nApplication of whitening agent"}
                  className={textareaClass}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Aftercare (one per line)
                </span>
                <textarea
                  rows={3}
                  value={form.aftercare}
                  onChange={(e) => update("aftercare", e.target.value)}
                  placeholder={"Avoid coffee and tea for 48 hours\nUse a sensitivity toothpaste if needed"}
                  className={textareaClass}
                />
              </label>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors  hover:bg-[#345263]"
                >
                  {modalMode === "edit" ? "Save Changes" : "Add Treatment"}
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

      {/* Treatment detail side panel */}
      {selectedTreatment && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setSelectedTreatment(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <button
                onClick={() => requestDeleteTreatment(selectedTreatment)}
                disabled={deletingId === selectedTreatment.id}
                aria-label="Delete treatment"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.85rem] font-medium text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                Delete
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Identity */}
              <div className="flex items-start gap-4">
                {selectedTreatment.imageUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white">
                    <Image
                      src={selectedTreatment.imageUrl}
                      alt={selectedTreatment.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  (() => {
                    const CategoryIcon =
                      CATEGORY_ICONS[selectedTreatment.category] ?? Sparkles;
                    const color =
                      CATEGORY_COLORS[selectedTreatment.category] ??
                      "bg-slate-100 text-slate-700";
                    return (
                      <div
                        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${color}`}
                      >
                        <CategoryIcon className="h-7 w-7" strokeWidth={2} />
                      </div>
                    );
                  })()
                )}

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedTreatment.name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-slate-500">
                    <span>{selectedTreatment.category}</span>
                    <span className="text-slate-300">|</span>
                    <span>{selectedTreatment.duration}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-medium text-slate-700">
                      NPR {selectedTreatment.price.toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-3 text-[0.85rem] leading-relaxed text-slate-600">
                    {selectedTreatment.description}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex items-center gap-6 border-b border-slate-900/10">
                {(
                  [
                    { key: "detail", label: "Detail Information" },
                    { key: "procedure", label: "Procedure Steps" },
                    { key: "aftercare", label: "Aftercare" },
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

              {/* Tab content */}
              {profileTab === "detail" && (
                <div className="mt-5 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                    Treatment Information
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-y-4 text-[0.85rem]">
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                        Treatment ID
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedTreatment.treatmentId ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <ListChecks className="h-3.5 w-3.5" strokeWidth={2} />
                        Sessions
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedTreatment.sessions ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Syringe className="h-3.5 w-3.5" strokeWidth={2} />
                        Anesthesia
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedTreatment.anesthesia ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Recovery Time
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedTreatment.recoveryTime ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Created Date
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedTreatment.createdDate ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "procedure" && (
                <div className="mt-5 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                    Procedure Steps
                  </p>
                  {selectedTreatment.procedureSteps &&
                  selectedTreatment.procedureSteps.length > 0 ? (
                    <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                      {selectedTreatment.procedureSteps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-3 text-[0.85rem] text-slate-500">
                      No procedure steps recorded yet.
                    </p>
                  )}
                </div>
              )}

              {profileTab === "aftercare" && (
                <div className="mt-5 rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                  <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                    Aftercare Instructions
                  </p>
                  {selectedTreatment.aftercare && selectedTreatment.aftercare.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                      {selectedTreatment.aftercare.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-[0.85rem] text-slate-500">
                      No aftercare instructions recorded yet.
                    </p>
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
              Do you want to delete {deleteTarget.name} ?
            </h3>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={confirmDeleteTreatment}
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