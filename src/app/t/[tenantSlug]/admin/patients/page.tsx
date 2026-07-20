"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Filter,
  SquarePen,
  ChevronLeft,
  Users,
  UserPlus,
  CalendarCheck,
  Mail,
  Phone,
  MapPin,
  Droplet,
  IdCard,
  Cake,
  VenusAndMars,
  Stethoscope,
  ClipboardList,
  AlertCircle,
  Pill,
  ImagePlus,
  User,
} from "lucide-react";

const STATUSES = ["Active", "Inactive"] as const;

const ASSIGNED_DOCTORS = [
  "Dr. Anisha Sharma",
  "Dr. Rajiv Thapa",
  "Dr. Priya Gurung",
  "Dr. Suresh Karki",
];

type Patient = {
  id: string;
  patientId: string;
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address?: string;
  assignedDoctor: string;
  lastVisit: string;
  status: (typeof STATUSES)[number];
  imageUrl?: string;
  allergies?: string[];
  medicalHistory?: string[];
  medications?: string[];
};

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "1",
    patientId: "PAT-1001",
    name: "Sita Rai",
    age: "28",
    gender: "Female",
    bloodGroup: "O+",
    phone: "9801112233",
    email: "sita.rai@email.com",
    address: "Bharatpur-10, Chitwan, Nepal",
    assignedDoctor: "Dr. Anisha Sharma",
    lastVisit: "2026-07-02",
    status: "Active",
    allergies: ["Penicillin"],
    medicalHistory: ["No major conditions reported"],
    medications: [],
  },
  {
    id: "2",
    patientId: "PAT-1002",
    name: "Bikash Thapa",
    age: "41",
    gender: "Male",
    bloodGroup: "B+",
    phone: "9802223344",
    email: "bikash.thapa@email.com",
    address: "Narayangarh-4, Chitwan, Nepal",
    assignedDoctor: "Dr. Rajiv Thapa",
    lastVisit: "2026-06-18",
    status: "Active",
    allergies: [],
    medicalHistory: ["Type 2 diabetes"],
    medications: ["Metformin 500mg"],
  },
  {
    id: "3",
    patientId: "PAT-1003",
    name: "Kamala Gurung",
    age: "6",
    gender: "Female",
    bloodGroup: "A+",
    phone: "9803334455",
    email: "kamala.parent@email.com",
    address: "Ratnanagar-2, Chitwan, Nepal",
    assignedDoctor: "Dr. Priya Gurung",
    lastVisit: "2026-05-27",
    status: "Active",
    allergies: [],
    medicalHistory: [],
    medications: [],
  },
  {
    id: "4",
    patientId: "PAT-1004",
    name: "Hari Karki",
    age: "63",
    gender: "Male",
    bloodGroup: "AB+",
    phone: "9804445566",
    email: "hari.karki@email.com",
    address: "Bharatpur-6, Chitwan, Nepal",
    assignedDoctor: "Dr. Suresh Karki",
    lastVisit: "2026-03-11",
    status: "Inactive",
    allergies: ["Latex"],
    medicalHistory: ["Hypertension"],
    medications: ["Amlodipine 5mg"],
  },
];

function initialsOf(name: string) {
  return name
    .trim()
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
];

const EMPTY_FORM = {
  imageUrl: "",
  name: "",
  age: "",
  gender: "Female",
  bloodGroup: "A+",
  phone: "",
  email: "",
  address: "",
  assignedDoctor: ASSIGNED_DOCTORS[0],
  status: "Active" as (typeof STATUSES)[number],
  lastVisit: "",
  allergies: "",
  medicalHistory: "",
  medications: "",
};

type FormState = typeof EMPTY_FORM;

function patientToForm(p: Patient): FormState {
  return {
    imageUrl: p.imageUrl ?? "",
    name: p.name,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    phone: p.phone,
    email: p.email,
    address: p.address ?? "",
    assignedDoctor: p.assignedDoctor,
    status: p.status,
    lastVisit: p.lastVisit,
    allergies: (p.allergies ?? []).join("\n"),
    medicalHistory: (p.medicalHistory ?? []).join("\n"),
    medications: (p.medications ?? []).join("\n"),
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const cellInputClass =
  "w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3] focus:bg-white";

const cellTextareaClass =
  "w-full resize-none rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3] focus:bg-white";

type FieldDef =
  | { key: keyof FormState; label: string; icon: typeof User; type: "text" | "email" | "tel" | "date" | "number"; placeholder?: string; required?: boolean }
  | { key: keyof FormState; label: string; icon: typeof User; type: "select"; options: readonly string[] }
  | { key: keyof FormState; label: string; icon: typeof User; type: "textarea"; placeholder?: string };

const FORM_SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Personal Information",
    fields: [
      { key: "name", label: "Full name", icon: User, type: "text", placeholder: "Sita Rai", required: true },
      { key: "gender", label: "Gender", icon: VenusAndMars, type: "select", options: ["Female", "Male", "Other"] },
      { key: "age", label: "Age", icon: Cake, type: "number", placeholder: "28" },
      { key: "bloodGroup", label: "Blood group", icon: Droplet, type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "patient@email.com" },
      { key: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "98XXXXXXXX", required: true },
      { key: "address", label: "Address", icon: MapPin, type: "text", placeholder: "Bharatpur-10, Chitwan, Nepal" },
    ],
  },
  {
    title: "Care Information",
    fields: [
      { key: "assignedDoctor", label: "Assigned doctor", icon: Stethoscope, type: "select", options: ASSIGNED_DOCTORS },
      { key: "status", label: "Status", icon: UserPlus, type: "select", options: STATUSES },
      { key: "lastVisit", label: "Last visit", icon: CalendarCheck, type: "date" },
    ],
  },
  {
    title: "Medical Information",
    fields: [
      { key: "allergies", label: "Known allergies (one per line)", icon: AlertCircle, type: "textarea", placeholder: "Penicillin" },
      { key: "medicalHistory", label: "Medical history (one per line)", icon: ClipboardList, type: "textarea", placeholder: "Type 2 diabetes" },
      { key: "medications", label: "Current medications (one per line)", icon: Pill, type: "textarea", placeholder: "Metformin 500mg" },
    ],
  },
];

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [query, setQuery] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [profileTab, setProfileTab] = useState<"detail" | "medical" | "appointments">(
    "detail"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    update("imageUrl", URL.createObjectURL(file));
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm({ ...EMPTY_FORM, lastVisit: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEditModal(p: Patient) {
    setModalMode("edit");
    setEditingId(p.id);
    setForm(patientToForm(p));
    setModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { allergies, medicalHistory, medications, ...rest } = form;
    const allergiesList = linesToArray(allergies);
    const medicalHistoryList = linesToArray(medicalHistory);
    const medicationsList = linesToArray(medications);

    if (modalMode === "edit" && editingId) {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...rest,
                allergies: allergiesList,
                medicalHistory: medicalHistoryList,
                medications: medicationsList,
              }
            : p
        )
      );
      setSelectedPatient((prev) =>
        prev && prev.id === editingId
          ? {
              ...prev,
              ...rest,
              allergies: allergiesList,
              medicalHistory: medicalHistoryList,
              medications: medicationsList,
            }
          : prev
      );
    } else {
      setPatients((prev) => [
        {
          id: crypto.randomUUID(),
          patientId: `PAT-${1000 + prev.length + 1}`,
          ...rest,
          allergies: allergiesList,
          medicalHistory: medicalHistoryList,
          medications: medicationsList,
        },
        ...prev,
      ]);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q);
      const matchesDoctor = doctorFilter === "All" || p.assignedDoctor === doctorFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesQuery && matchesDoctor && matchesStatus;
    });
  }, [patients, query, doctorFilter, statusFilter]);

  const newThisMonth = useMemo(() => {
    const now = new Date();
    return patients.filter((p) => {
      const visit = new Date(p.lastVisit);
      return visit.getMonth() === now.getMonth() && visit.getFullYear() === now.getFullYear();
    }).length;
  }, [patients]);

  const stats = [
    { icon: Users, label: "Total Patients", value: String(patients.length) },
    { icon: UserPlus, label: "New This Month", value: String(newThisMonth) },
    { icon: CalendarCheck, label: "Active Patients", value: String(patients.filter((p) => p.status === "Active").length) },
  ];

  function openProfile(p: Patient) {
    setSelectedPatient(p);
    setProfileTab("detail");
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 w-full bg-white px-6 py-6 lg:px-10">
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#345263] sm:text-3xl">
          Patients
        </h1>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-6 lg:px-10">

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

  
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-900/5 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patients..."
                  className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>


            <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-full border border-slate-900/10 bg-white pl-9 pr-4 py-2.5 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
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
              Add Patient
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-y border-slate-900/5 bg-slate-50/60">
                  <th className="px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Age
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Blood Group
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Assigned Doctor
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Last Visit
                  </th>
                  <th className="px-4 py-3 text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[0.78rem] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <tr
                      key={p.id}
                      onClick={() => openProfile(p)}
                      className="cursor-pointer border-b border-slate-900/5 transition-colors last:border-b-0 hover:bg-[#7da3b3]/[0.04]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                              <Image src={p.imageUrl} alt={p.name} fill unoptimized className="object-cover" />
                            </div>
                          ) : (
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold ${color}`}>
                              {initialsOf(p.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-[0.9rem] font-medium text-slate-900">{p.name}</p>

                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-600">{p.age}yrs</td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-600">{p.gender}</td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-700">{p.phone}</td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-500">{p.email}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[0.75rem] font-medium text-rose-600">
                          <Droplet className="h-3 w-3" strokeWidth={2} />
                          {p.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-600">{p.assignedDoctor}</td>
                      <td className="px-4 py-4 text-[0.85rem] text-slate-600">
                        {new Date(p.lastVisit).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-medium",
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(p);
                          }}
                          aria-label="Edit patient"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-[#3f6274]"
                        >
                          <SquarePen className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center text-slate-500">
                      No patients match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

  
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
                {modalMode === "edit" ? "Edit Patient" : "Add Patient"}
              </h2>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-8">


                {FORM_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="overflow-hidden rounded-2xl border border-slate-900/5 bg-white shadow-sm"
                  >
                    <p className="border-b border-slate-900/5 px-5 py-3 text-[0.88rem] font-semibold text-slate-900">
                      <span className="border-l-2 border-[#3f6274] pl-2">{section.title}</span>
                    </p>
                    <table className="w-full border-collapse">
                      <tbody>
                        {section.fields.map((field, i) => {
                          const Icon = field.icon;
                          return (
                            <tr
                              key={field.key}
                              className={i !== section.fields.length - 1 ? "border-b border-slate-900/5" : ""}
                            >
                              <td className="w-40 shrink-0 bg-slate-50/60 px-4 py-2.5 align-top sm:w-48">
                                <span className="flex items-center gap-1.5 text-[0.78rem] font-medium text-slate-600">
                                  <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                                  {field.label}
                                  {"required" in field && field.required && (
                                    <span className="text-rose-400">*</span>
                                  )}
                                </span>
                              </td>
                              <td className="px-3 py-1">
                                {field.type === "select" ? (
                                  <select
                                    value={form[field.key]}
                                    onChange={(e) => update(field.key, e.target.value)}
                                    className={cellInputClass}
                                  >
                                    {field.options.map((opt) => (
                                      <option key={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : field.type === "textarea" ? (
                                  <textarea
                                    rows={2}
                                    value={form[field.key]}
                                    onChange={(e) => update(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className={cellTextareaClass}
                                  />
                                ) : (
                                  <input
                                    type={field.type}
                                    required={"required" in field ? field.required : false}
                                    value={form[field.key]}
                                    onChange={(e) => update(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className={cellInputClass}
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-[#345263]"
                  >
                    {modalMode === "edit" ? "Save Changes" : "Add Patient"}
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

      {/* Patient detail side panel */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div onClick={() => setSelectedPatient(null)} className="absolute inset-0" aria-hidden />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-start gap-4">
                {selectedPatient.imageUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white">
                    <Image src={selectedPatient.imageUrl} alt={selectedPatient.name} fill unoptimized className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[1.3rem] font-semibold text-[#3f6274] ring-4 ring-white">
                    {initialsOf(selectedPatient.name)}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedPatient.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-slate-500">
                    <span>{selectedPatient.patientId}</span>
                    <span className="text-slate-300">|</span>
                    <span>{selectedPatient.age} yrs, {selectedPatient.gender}</span>
                    <span className="text-slate-300">|</span>
                    <span
                      className={
                        selectedPatient.status === "Active" ? "text-emerald-600" : "text-slate-500"
                      }
                    >
                      {selectedPatient.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[0.85rem] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedPatient.address ?? "Address not provided"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedPatient.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedPatient.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-6 border-b border-slate-900/10">
                {(
                  [
                    { key: "detail", label: "Detail Information" },
                    { key: "medical", label: "Medical History" },
                    { key: "appointments", label: "Appointment History" },
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
                    Patient Information
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-y-4 text-[0.85rem]">
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                        Patient ID
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selectedPatient.patientId}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Droplet className="h-3.5 w-3.5" strokeWidth={2} />
                        Blood Group
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selectedPatient.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <VenusAndMars className="h-3.5 w-3.5" strokeWidth={2} />
                        Gender
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selectedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Cake className="h-3.5 w-3.5" strokeWidth={2} />
                        Age
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selectedPatient.age} Years Old</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                        Assigned Doctor
                      </p>
                      <p className="mt-1 font-medium text-slate-800">{selectedPatient.assignedDoctor}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <CalendarCheck className="h-3.5 w-3.5" strokeWidth={2} />
                        Last Visit
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {new Date(selectedPatient.lastVisit).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profileTab === "medical" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
                      Allergies
                    </p>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                        {selectedPatient.allergies.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[0.85rem] text-slate-500">No known allergies.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
                      Medical History
                    </p>
                    {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                        {selectedPatient.medicalHistory.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[0.85rem] text-slate-500">No conditions recorded.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      <Pill className="h-3.5 w-3.5" strokeWidth={2} />
                      Current Medications
                    </p>
                    {selectedPatient.medications && selectedPatient.medications.length > 0 ? (
                      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                        {selectedPatient.medications.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-[0.85rem] text-slate-500">No medications recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {profileTab === "appointments" && (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-900/15 bg-white p-10 text-center text-[0.85rem] text-slate-500 shadow-sm">
                  No appointment history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}