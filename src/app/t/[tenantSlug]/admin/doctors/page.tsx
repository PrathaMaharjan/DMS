"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  Search,
  Plus,
  Star,
  MoreVertical,
  User,
  Mail,
  Phone,
  GraduationCap,
  BriefcaseMedical,
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
  PhoneCall,
  Filter,
  ChevronLeft,
  SquarePen,
  MapPin,
  IdCard,
  Droplet,
  Cake,
  Clock,
  VenusAndMars,
} from "lucide-react";

const SPECIALIZATIONS = [
  "General Dentistry",
  "Orthodontics",
  "Endodontics",
  "Periodontics",
  "Oral Surgery",
  "Pediatric Dentistry",
];

const SPECIALIZATION_MAP_BACKEND: Record<string, string> = {
  "General Dentistry": "general_dentistry",
  "Orthodontics": "orthodontics",
  "Endodontics": "endodontics",
  "Periodontics": "periodontics",
  "Oral Surgery": "oral_surgery",
  "Pediatric Dentistry": "pediatric_dentistry",
};

const SPECIALIZATION_MAP_FRONTEND: Record<string, string> = {
  "general_dentistry": "General Dentistry",
  "orthodontics": "Orthodontics",
  "endodontics": "Endodontics",
  "periodontics": "Periodontics",
  "oral_surgery": "Oral Surgery",
  "pediatric_dentistry": "Pediatric Dentistry",
  "prosthodontics": "Prosthodontics",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Female", "Male", "Other"];

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
];

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  email: string;
  phone: string;
  qualification: string;
  rating: number;
  patients: number;
  imageUrl?: string;
  doctorId?: string;
  age?: string;
  bloodGroup?: string;
  gender?: string;
  dob?: string;
  createdDate?: string;
  address?: string;
  education?: string[];
  experienceNotes?: string[];
};

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Anisha Sharma",
    specialization: "Orthodontics",
    experience: "9",
    email: "anisha.sharma@chitwandental.com",
    phone: "9801234567",
    qualification: "BDS, MDS (Orthodontics)",
    rating: 4.8,
    patients: 214,
    doctorId: "DOC-1001",
    age: "34",
    bloodGroup: "O+",
    gender: "Female",
    dob: "12 Mar 1992",
    createdDate: "2023-02-14 10:05:00",
    address: "Bharatpur-10, Chitwan, Nepal",
    education: [
      "Bachelor of Dental Surgery (BDS), Kathmandu University",
      "MDS in Orthodontics, Manipal College of Dental Sciences",
    ],
    experienceNotes: [
      "9 years of clinical practice in orthodontics and dentofacial orthopedics",
      "Specializes in clear aligners and early interceptive treatment for children",
    ],
  },
  {
    id: "2",
    name: "Dr. Rajiv Thapa",
    specialization: "Oral Surgery",
    experience: "12",
    email: "rajiv.thapa@chitwandental.com",
    phone: "9807654321",
    qualification: "BDS, MDS (Oral & Maxillofacial Surgery)",
    rating: 4.6,
    patients: 331,
    doctorId: "DOC-1002",
    age: "39",
    bloodGroup: "B+",
    gender: "Male",
    dob: "5 Jul 1987",
    createdDate: "2022-11-02 09:20:00",
    address: "Narayangarh-4, Chitwan, Nepal",
    education: [
      "Bachelor of Dental Surgery (BDS), B.P. Koirala Institute of Health Sciences",
      "MDS in Oral & Maxillofacial Surgery, Manipal University",
    ],
    experienceNotes: [
      "12 years of experience in complex extractions and jaw reconstruction",
      "Led over 300 wisdom tooth and dental implant procedures",
    ],
  },
  {
    id: "3",
    name: "Dr. Priya Gurung",
    specialization: "Pediatric Dentistry",
    experience: "6",
    email: "priya.gurung@chitwandental.com",
    phone: "9812345678",
    qualification: "BDS, MDS (Pediatric Dentistry)",
    rating: 4.9,
    patients: 178,
    doctorId: "DOC-1003",
    age: "31",
    bloodGroup: "A+",
    gender: "Female",
    dob: "21 Sep 1995",
    createdDate: "2024-01-18 13:45:00",
    address: "Ratnanagar-2, Chitwan, Nepal",
    education: [
      "Bachelor of Dental Surgery (BDS), Kantipur Dental College",
      "MDS in Pediatric & Preventive Dentistry, Nair Hospital Dental College",
    ],
    experienceNotes: [
      "6 years focused on child-friendly, anxiety-free dental care",
      "Runs the clinic's school outreach program for dental hygiene education",
    ],
  },
  {
    id: "4",
    name: "Dr. Suresh Karki",
    specialization: "Periodontics",
    experience: "15",
    email: "suresh.karki@chitwandental.com",
    phone: "9845678901",
    qualification: "BDS, MDS (Periodontics)",
    rating: 4.7,
    patients: 402,
    doctorId: "DOC-1004",
    age: "44",
    bloodGroup: "AB+",
    gender: "Male",
    dob: "3 Jan 1982",
    createdDate: "2021-06-09 08:30:00",
    address: "Bharatpur-6, Chitwan, Nepal",
    education: [
      "Bachelor of Dental Surgery (BDS), Chitwan Medical College",
      "MDS in Periodontics, Government Dental College, Mumbai",
    ],
    experienceNotes: [
      "15 years treating gum disease and performing dental implant surgery",
      "Regularly trains junior dentists on periodontal flap procedures",
    ],
  },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  specialization: SPECIALIZATIONS[0],
  experience: "",
  qualification: "",
  imageUrl: "",
  age: "",
  bloodGroup: BLOOD_GROUPS[0],
  gender: GENDERS[0],
  dob: "",
  address: "",
  education: "",
  experienceNotes: "",
};

type FormState = typeof EMPTY_FORM;

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";

const textareaClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7da3b3]";


function doctorToForm(doc: Doctor): FormState {
  return {
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    specialization: doc.specialization,
    experience: doc.experience,
    qualification: doc.qualification,
    imageUrl: doc.imageUrl ?? "",
    age: doc.age ?? "",
    bloodGroup: doc.bloodGroup ?? BLOOD_GROUPS[0],
    gender: doc.gender ?? GENDERS[0],
    dob: doc.dob ?? "",
    address: doc.address ?? "",
    education: (doc.education ?? []).join("\n"),
    experienceNotes: (doc.experienceNotes ?? []).join("\n"),
  };
}

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileTab, setProfileTab] = useState<"detail" | "patients" | "appointments">(
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

      // Fetch doctors
      const res = await axios.get("/api/doctor");
      if (res.data?.success) {
        const dbDoctors = res.data.doctors || [];
        const mapped = dbDoctors.map((d: any, index: number) => ({
          id: d.id,
          name: d.name,
          specialization: SPECIALIZATION_MAP_FRONTEND[d.specialization] || "General Dentistry",
          experience: String(d.yearsOfExperience ?? 0),
          email: d.email,
          phone: d.phone || "",
          qualification: d.qualification || "BDS",
          rating: 5.0,
          patients: d.patientsCheckedUp ?? 0,
          imageUrl: d.photoUrl || undefined,
          doctorId: `DOC-${1000 + index + 1}`,
          age: d.age || "30",
          bloodGroup: d.bloodGroup || "O+",
          gender: d.gender || "Female",
          dob: d.dob || "",
          createdDate: d.createdAt ? new Date(d.createdAt).toISOString().slice(0, 16).replace("T", " ") : "",
          address: d.address || "",
          education: d.education ? [d.education] : [],
          experienceNotes: d.bio ? [d.bio] : [],
        }));
        setDoctors(mapped);
      }
    } catch (err) {
      console.error("Failed to load doctors data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openProfile(doc: Doctor) {
    setSelectedDoctor(doc);
    setProfileTab("detail");
  }

  function openAddModal() {
    setModalMode("add");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setModalOpen(true);
  }

  function openEditModal(doc: Doctor) {
    setModalMode("edit");
    setEditingId(doc.id);
    setForm(doctorToForm(doc));
    setSubmitError(null);
    setModalOpen(true);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q);
      const matchesSpecialization =
        specializationFilter === "All" || d.specialization === specializationFilter;
      return matchesQuery && matchesSpecialization;
    });
  }, [doctors, query, specializationFilter]);

  const avgRating = useMemo(() => {
    if (doctors.length === 0) return 0;
    return doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length;
  }, [doctors]);

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
    setSubmitError(null);
    setSubmitting(true);

    const { education, experienceNotes, ...rest } = form;
    const educationList = linesToArray(education);
    const experienceNotesList = linesToArray(experienceNotes);

    try {
      if (modalMode === "edit" && editingId) {
        setDoctors((prev) =>
          prev.map((d) =>
            d.id === editingId
              ? {
                ...d,
                ...rest,
                education: educationList,
                experienceNotes: experienceNotesList,
              }
              : d
          )
        );
        setSelectedDoctor((prev) =>
          prev && prev.id === editingId
            ? { ...prev, ...rest, education: educationList, experienceNotes: experienceNotesList }
            : prev
        );
      } else {
        if (!locationId) {
          setSubmitError("Could not determine location ID. Please configure services first.");
          setSubmitting(false);
          return;
        }

        const payload: Record<string, unknown> = {
          locationId,
          name: form.name,
          email: form.email,
          password: "Password123!",
          specialization: SPECIALIZATION_MAP_BACKEND[form.specialization] || "general_dentistry",
          yearsOfExperience: parseInt(form.experience, 10) || 0,
          employmentType: "full_time",
        };

        // Only include optional fields if they have values
        if (form.phone.trim()) payload.phone = form.phone.trim();
        if (form.imageUrl) payload.photoKey = form.imageUrl;
        if (form.qualification) payload.qualification = form.qualification;
        if (educationList.length > 0) payload.education = educationList.join("\n");
        if (experienceNotesList.length > 0) payload.bio = experienceNotesList.join("\n");
        if (form.dob) payload.dateOfBirth = form.dob;
        if (form.bloodGroup) payload.bloodGroup = form.bloodGroup;
        if (form.gender) payload.gender = form.gender;
        if (form.address) payload.address = form.address;

        const res = await axios.post("/api/doctor", payload);
        if (res.data?.success) {
          const newDoc = res.data.data.doctor;
          setDoctors((prev) => [
            {
              id: newDoc.id,
              rating: 5,
              patients: 0,
              doctorId: `DOC-${1000 + prev.length + 1}`,
              createdDate: new Date().toISOString().slice(0, 16).replace("T", " "),
              name: newDoc.name,
              email: newDoc.email,
              phone: form.phone,
              specialization: form.specialization,
              experience: form.experience,
              qualification: form.qualification,
              imageUrl: newDoc.photoUrl || undefined,
              age: form.age,
              bloodGroup: form.bloodGroup,
              gender: form.gender,
              dob: form.dob,
              address: form.address,
              education: educationList,
              experienceNotes: experienceNotesList,
            },
            ...prev,
          ]);
        }
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      setSubmitError(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Error submitting doctor:", err);
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.error || "An error occurred. Please try again.");
      } else {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const stats = [
    {
      icon: Stethoscope,
      label: "Total Doctors",
      value: String(doctors.length),
      trend: "+2 this month",
      trendUp: true,
    },
    {
      icon: CalendarCheck,
      label: "Appointments Today",
      value: "38",
      trend: "Decreased by 6%",
      trendUp: false,
    },
    {
      icon: Star,
      label: "Average Rating",
      value: avgRating.toFixed(1),
      trend: "Increased by 4%",
      trendUp: true,
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
          Doctors
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
                  placeholder="Search doctors..."
                  className="w-56 rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-4 text-[0.9rem] text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#7da3b3]"
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="appearance-none rounded-full border border-slate-900/10 bg-white py-2.5 pl-9 pr-8 text-[0.9rem] text-slate-900 outline-none focus:border-[#7da3b3]"
                >
                  <option value="All">All specializations</option>
                  {SPECIALIZATIONS.map((s) => (
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
              Add Doctor
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-500">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#7da3b3]" />
                <p className="mt-4 text-[0.9rem]">Loading doctors...</p>
              </div>
            ) : (
              filtered.map((doc, i) => {
                const initials = doc.name
                  .replace("Dr.", "")
                  .trim()
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

                return (
                  <div
                    key={doc.id}
                    onClick={() => openProfile(doc)}
                    className="group cursor-pointer rounded-2xl border border-slate-900/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#7da3b3]/30 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      {doc.imageUrl ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-slate-50">
                          <Image
                            src={doc.imageUrl}
                            alt={doc.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full text-[1.05rem] font-semibold ring-4 ring-slate-50 ${color}`}
                        >
                          {initials}
                        </div>
                      )}
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(doc);
                          }}
                          aria-label="Edit doctor"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-100 hover:text-[#3f6274]"
                        >
                          <SquarePen className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-[1.02rem] font-semibold text-slate-900">{doc.name}</p>

                    <span className="mt-2 inline-flex items-center rounded-full bg-[#7da3b3]/10 px-2.5 py-1 text-[0.75rem] font-medium text-[#3f6274]">
                      {doc.specialization}
                    </span>

                    <div className="mt-3 flex items-center gap-1.5 text-[0.8rem] text-slate-500">
                      <BriefcaseMedical className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {doc.experience} years experience
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-900/5 pt-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[0.85rem] font-medium text-slate-700">
                          {doc.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[0.8rem] text-slate-500">{doc.patients} patients</p>
                    </div>
                  </div>
                );
              })
            )}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-900/15 bg-white py-16 text-center text-slate-500">
                No doctors match your filters.
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

            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
                    {form.imageUrl ? (
                      <Image
                        src={form.imageUrl}
                        alt="Doctor preview"
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
                    <User className="h-3.5 w-3.5" strokeWidth={2} />
                    Full name
                  </span>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder=""
                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                      Specialization
                    </span>
                    <select
                      value={form.specialization}
                      onChange={(e) => update("specialization", e.target.value)}
                      className={inputClass}
                    >
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <BriefcaseMedical className="h-3.5 w-3.5" strokeWidth={2} />
                      Experience
                    </span>
                    <input
                      required
                      type="number"
                      min={0}
                      value={form.experience}
                      onChange={(e) => update("experience", e.target.value)}

                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                    Qualification
                  </span>
                  <input
                    required
                    type="text"
                    value={form.qualification}
                    onChange={(e) => update("qualification", e.target.value)}

                    className={inputClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                      Age
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={form.age}
                      onChange={(e) => update("age", e.target.value)}

                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Cake className="h-3.5 w-3.5" strokeWidth={2} />
                      Date of birth
                    </span>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => update("dob", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <Droplet className="h-3.5 w-3.5" strokeWidth={2} />
                      Blood group
                    </span>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => update("bloodGroup", e.target.value)}
                      className={inputClass}
                    >
                      {BLOOD_GROUPS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                      <VenusAndMars className="h-3.5 w-3.5" strokeWidth={2} />
                      Gender
                    </span>
                    <select
                      value={form.gender}
                      onChange={(e) => update("gender", e.target.value)}
                      className={inputClass}
                    >
                      {GENDERS.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                    Address
                  </span>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}

                    className={inputClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                    Education
                  </span>
                  <textarea
                    rows={3}
                    value={form.education}
                    onChange={(e) => update("education", e.target.value)}

                    className={textareaClass}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                    <BriefcaseMedical className="h-3.5 w-3.5" strokeWidth={2} />
                    Experience
                  </span>
                  <textarea
                    rows={3}
                    value={form.experienceNotes}
                    onChange={(e) => update("experienceNotes", e.target.value)}

                    className={textareaClass}
                  />
                </label>

                {submitError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[0.85rem] text-rose-700">
                    {submitError}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-[#7da3b3] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-colors hover:bg-[#345263] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Saving..." : modalMode === "edit" ? "Save Changes" : "Add Doctor"}
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

      {/* Doctor profile side panel */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
          <div
            onClick={() => setSelectedDoctor(null)}
            className="absolute inset-0"
            aria-hidden
          />
          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-slate-50 shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-slate-900/5 bg-slate-50 px-6 py-4">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
            </div>

            <div className="px-6 py-6">
              {/* Identity */}
              <div className="flex items-start gap-4">
                {selectedDoctor.imageUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-white">
                    <Image
                      src={selectedDoctor.imageUrl}
                      alt={selectedDoctor.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#7da3b3]/15 text-[1.3rem] font-semibold text-[#3f6274] ring-4 ring-white">
                    {selectedDoctor.name
                      .replace("Dr.", "")
                      .trim()
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedDoctor.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-slate-500">
                    <span>{selectedDoctor.specialization}</span>
                    <span className="text-slate-300">|</span>
                    <span>{selectedDoctor.experience} years experience</span>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.round(selectedDoctor.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                            }`}
                        />
                      ))}
                      <span className="ml-1 font-medium text-slate-700">
                        {selectedDoctor.rating.toFixed(1)}
                      </span>
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[0.85rem] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedDoctor.address ?? "Address not provided"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedDoctor.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                      {selectedDoctor.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex items-center gap-6 border-b border-slate-900/10">
                {(
                  [
                    { key: "detail", label: "Detail Information" },
                    { key: "patients", label: "Patient History" },
                    { key: "appointments", label: "Appointment History" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProfileTab(tab.key)}
                    className={`-mb-px border-b-2 px-1 pb-3 text-[0.85rem] font-medium transition-colors ${profileTab === tab.key
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
                    Doctor Information
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-y-4 text-[0.85rem]">
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <IdCard className="h-3.5 w-3.5" strokeWidth={2} />
                        Doctor ID
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.doctorId ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <User className="h-3.5 w-3.5" strokeWidth={2} />
                        Age
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.age ? `${selectedDoctor.age} Years Old` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Droplet className="h-3.5 w-3.5" strokeWidth={2} />
                        Blood Group
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.bloodGroup ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <VenusAndMars className="h-3.5 w-3.5" strokeWidth={2} />
                        Gender
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.gender ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Cake className="h-3.5 w-3.5" strokeWidth={2} />
                        Date of Birth
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.dob ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                        Created Date
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {selectedDoctor.createdDate ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-900/5 pt-5">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      Education
                    </p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                      {(selectedDoctor.education ?? [selectedDoctor.qualification]).map(
                        (item) => (
                          <li key={item}>{item}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="mt-6 border-t border-slate-900/5 pt-5">
                    <p className="flex items-center gap-1.5 border-l-2 border-[#3f6274] pl-2 text-[0.9rem] font-semibold text-slate-900">
                      Experience
                    </p>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.85rem] text-slate-600">
                      {(
                        selectedDoctor.experienceNotes ?? [
                          `${selectedDoctor.experience} years of experience in ${selectedDoctor.specialization.toLowerCase()}`,
                        ]
                      ).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {profileTab === "patients" && (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-900/15 bg-white p-10 text-center text-[0.85rem] text-slate-500 shadow-sm">
                  No patient history recorded yet.
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