"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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

const INITIAL_TREATMENTS: Treatment[] = [
  {
    id: "1",
    name: "Teeth Whitening",
    category: "Cosmetic",
    duration: "45 mins",
    price: 6500,
    description:
      "In-office bleaching treatment that lifts stains and brightens the smile by several shades in a single visit.",
    treatmentId: "TRT-1001",
    sessions: "1",
    recoveryTime: "None",
    anesthesia: "None",
    createdDate: "2023-03-11 09:00:00",
    procedureSteps: [
      "Shade assessment and gum protection with a barrier gel",
      "Application of whitening agent activated with LED light",
      "Two to three cycles of 15 minutes with reapplication",
    ],
    aftercare: [
      "Avoid coffee, tea, and red wine for 48 hours",
      "Use a sensitivity toothpaste if mild sensitivity occurs",
    ],
  },
  {
    id: "2",
    name: "Root Canal Treatment",
    category: "Restorative",
    duration: "90 mins",
    price: 12000,
    description:
      "Removes infected pulp tissue, cleans and seals the root canal system to save a severely decayed or infected tooth.",
    treatmentId: "TRT-1002",
    sessions: "2",
    recoveryTime: "2-3 days",
    anesthesia: "Local",
    createdDate: "2022-11-20 11:30:00",
    procedureSteps: [
      "Local anesthesia and isolation of the tooth with a rubber dam",
      "Access opening and removal of infected pulp",
      "Cleaning, shaping, and obturation of the root canals",
      "Placement of a temporary or permanent filling",
    ],
    aftercare: [
      "Avoid chewing on the treated side until the crown is placed",
      "Mild soreness for 2-3 days is normal; use prescribed painkillers if needed",
    ],
  },
  {
    id: "3",
    name: "Dental Implant",
    category: "Surgical",
    duration: "120 mins",
    price: 55000,
    description:
      "Titanium implant post surgically placed into the jawbone to replace a missing tooth root, topped later with a crown.",
    treatmentId: "TRT-1003",
    sessions: "3",
    recoveryTime: "3-6 months for full integration",
    anesthesia: "Local",
    createdDate: "2023-07-02 08:45:00",
    procedureSteps: [
      "Jawbone assessment via 3D imaging and treatment planning",
      "Surgical placement of the titanium implant fixture",
      "Healing period for osseointegration",
      "Abutment and crown placement",
    ],
    aftercare: [
      "Soft diet for the first week",
      "Avoid smoking during the healing period to protect integration",
    ],
  },
  {
    id: "4",
    name: "Scaling and Polishing",
    category: "Preventive",
    duration: "30 mins",
    price: 2500,
    description:
      "Routine cleaning that removes plaque and tartar buildup above and below the gumline, followed by a polish.",
    treatmentId: "TRT-1004",
    sessions: "1",
    recoveryTime: "None",
    anesthesia: "None",
    createdDate: "2024-02-05 10:15:00",
    procedureSteps: [
      "Ultrasonic scaling to remove plaque and calculus",
      "Hand scaling for stubborn deposits near the gumline",
      "Polishing with a rotary brush and prophylaxis paste",
    ],
    aftercare: [
      "Mild gum sensitivity for a day is normal",
      "Recommended every 6 months for maintenance",
    ],
  },
];

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
  const [treatments, setTreatments] = useState<Treatment[]>(INITIAL_TREATMENTS);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { procedureSteps, aftercare, price, ...rest } = form;
    const procedureList = linesToArray(procedureSteps);
    const aftercareList = linesToArray(aftercare);
    const priceNumber = Number(price) || 0;

    if (modalMode === "edit" && editingId) {
      setTreatments((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...rest,
                price: priceNumber,
                procedureSteps: procedureList,
                aftercare: aftercareList,
              }
            : t
        )
      );

      setSelectedTreatment((prev) =>
        prev && prev.id === editingId
          ? {
              ...prev,
              ...rest,
              price: priceNumber,
              procedureSteps: procedureList,
              aftercare: aftercareList,
            }
          : prev
      );
    } else {
      setTreatments((prev) => [
        {
          id: crypto.randomUUID(),
          treatmentId: `TRT-${1000 + prev.length + 1}`,
          createdDate: new Date().toISOString().slice(0, 16).replace("T", " "),
          ...rest,
          price: priceNumber,
          procedureSteps: procedureList,
          aftercare: aftercareList,
        },
        ...prev,
      ]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(false);
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
            {filtered.map((t) => {
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

  <button
    onClick={(e) => {
      e.stopPropagation();
      openEditModal(t);
    }}
    aria-label="Edit treatment"
    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
  >
    <SquarePen className="h-4 w-4 text-slate-600" strokeWidth={2} />
  </button>
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
            })}

            {filtered.length === 0 && (
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
    </div>
  );
}