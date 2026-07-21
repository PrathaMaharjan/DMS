"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Check,
  X,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  User,
  UserCheck,
  UserX,
  Calendar,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ListChecks,
  Inbox,
  StickyNote,
} from "lucide-react";

const SERVICES = ["Routine Checkup & Cleaning", "Teeth Whitening", "Root Canal Treatment", "Dental Implants", "Braces & Aligners", "Emergency Care"];
const DENTISTS = ["Pratha Maharjan", "Sophan Shrestha", "Suprasidhhi Pradhan", "Pragun Maskey"];
const inputClass = "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";
const ITEMS_PER_PAGE = 8;

// Source badge colors are shared between the pending-review cards and the
// main table's "Type" column, so they stay in one place and stay in sync
// with the rest of the palette (teal/sky, not purple).
function sourceBadgeClasses(source: string) {
  return source === "Online"
    ? "bg-sky-50 text-sky-700 border border-sky-100"
    : "bg-amber-50 text-amber-700 border border-amber-100";
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  dob: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
}

interface Appointment {
  id: string;
  patient: string;
  phone: string;
  email: string;
  dentist: string;
  service: string;
  date: string;
  time: string;
  source: string;
  status: "Pending" | "Confirmed" | "Rejected";
  attendance: string;
  notes?: string;
}

const EXISTING_PATIENTS: Patient[] = [
  { id: "P-101", firstName: "Aayush", lastName: "Shrestha", name: "Aayush Shrestha", dob: "1998-05-14", age: "28", gender: "Male", phone: "9841234567", email: "aayush@gmail.com" },
  { id: "P-102", firstName: "Melina", lastName: "Joshi", name: "Melina Joshi", dob: "2001-09-20", age: "24", gender: "Female", phone: "9808765432", email: "melina.j@gmail.com" },
  { id: "P-103", firstName: "Rohan", lastName: "Basnet", name: "Rohan Basnet", dob: "1995-11-03", age: "30", gender: "Male", phone: "9841999888", email: "rohan@gmail.com" },
];

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", patient: "Aayush Shrestha", phone: "9841234567", email: "aayush@gmail.com", dentist: "Pratha Maharjan", service: "Routine Checkup", date: "2026-07-21", time: "09:00", source: "Online", status: "Pending", attendance: "Pending", notes: "Patient requested the earliest slot available; mild sensitivity on upper left molar." },
    { id: "2", patient: "Melina Joshi", phone: "9808765432", email: "melina.j@gmail.com", dentist: "Sophan Shrestha", service: "Braces & Aligners", date: "2026-07-21", time: "10:30", source: "Online", status: "Confirmed", attendance: "Pending" },
    { id: "3", patient: "Rohan Basnet", phone: "9841999888", email: "rohan@gmail.com", dentist: "Pragun Maskey", service: "Emergency Care", date: "2026-07-22", time: "13:00", source: "Walk-in", status: "Confirmed", attendance: "Checked In" },
    { id: "4", patient: "Aayush Shrestha", phone: "9841234567", email: "aayush@gmail.com", dentist: "Suprasidhhi Pradhan", service: "Teeth Whitening", date: "2026-07-23", time: "15:30", source: "Online", status: "Pending", attendance: "Pending", notes: "Wants shade options discussed before starting." },
  ]);

  const [patientsList, setPatientsList] = useState<Patient[]>(EXISTING_PATIENTS);


  const [view, setView] = useState<"list" | "review">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterSource, setFilterSource] = useState<"All" | "Online" | "Walk-in">("All");
  const [filterDate, setFilterDate] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Booking Form State
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [patientMode, setPatientMode] = useState<"search" | "new">("search");
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [newAppt, setNewAppt] = useState({ dentist: DENTISTS[0], service: SERVICES[0], date: "", time: "" });

  const initialRegisterForm = {
    firstName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "Male",
    phone: "",
    email: ""
  };
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  const filteredPatients = searchPatientQuery
    ? patientsList.filter(p => p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()))
    : [];

  // Helper to auto-calculate age based on DOB
  const handleDobChange = (dobValue: string) => {
    let calculatedAge = "";
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      calculatedAge = age >= 0 ? String(age) : "";
    }
    setRegisterForm(prev => ({ ...prev, dob: dobValue, age: calculatedAge }));
  };

  function handleQuickRegister(e: React.FormEvent) {
    e.preventDefault();
    const newId = `P-${100 + patientsList.length + 1}`;
    const fullName = `${registerForm.firstName.trim()} ${registerForm.lastName.trim()}`;

    const brandNewPatient: Patient = {
      id: newId,
      ...registerForm,
      name: fullName
    };

    setPatientsList([...patientsList, brandNewPatient]);
    setSelectedPatient(brandNewPatient);
    setSearchPatientQuery("");
  }

  function handleAddAppt(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) return alert("Please select or register a patient first.");

    setAppointments([
      ...appointments,
      {
        id: String(Date.now()),
        patient: selectedPatient.name,
        phone: selectedPatient.phone,
        email: selectedPatient.email,
        ...newAppt,
        source: "Walk-in",
        status: "Confirmed",
        attendance: "Checked In"
      }
    ]);

    setShowAddAppt(false);
    setSelectedPatient(null);
    setSearchPatientQuery("");
    setRegisterForm(initialRegisterForm);
    setPatientMode("search");
    setCurrentPage(1);
  }

  function handleAccept(id: string) {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, status: "Confirmed" } : appt))
    );
  }

  function handleReject(id: string) {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, status: "Rejected", attendance: "Cancelled" } : appt))
    );
  }

  function handleAttendance(id: string, attendanceStatus: "Checked In" | "No-Show") {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, attendance: attendanceStatus } : appt))
    );
  }

  function handleDentistChange(id: string, newDentist: string) {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, dentist: newDentist } : appt))
    );
  }

  // Pending appointments waiting for front-desk review
  const pendingAppointments = useMemo(
    () => appointments.filter(a => a.status === "Pending"),
    [appointments]
  );

  // Filter Logic — the main list only ever shows Confirmed appointments
  const filteredAppointments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return appointments.filter(appt => {
      if (appt.status !== "Confirmed") return false;
      const matchesSearch =
        !q ||
        appt.patient.toLowerCase().includes(q) ||
        appt.phone.toLowerCase().includes(q) ||
        appt.email.toLowerCase().includes(q) ||
        appt.dentist.toLowerCase().includes(q);
      const matchesSource = filterSource === "All" ? true : appt.source === filterSource;
      const matchesDate = filterDate ? appt.date === filterDate : true;
      return matchesSearch && matchesSource && matchesDate;
    });
  }, [appointments, searchQuery, filterSource, filterDate]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedAppointments = useMemo(() => {
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, startIndex]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterSourceChange = (src: "All" | "Online" | "Walk-in") => {
    setFilterSource(src);
    setCurrentPage(1);
  };

  const handleFilterDateChange = (date: string) => {
    setFilterDate(date);
    setCurrentPage(1);
  };

  return (
    <div className="w-full py-6">
      <div className="space-y-6 w-full">

        {/* Page Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              Appointments
            </button>
            <button
              onClick={() => setView("review")}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                view === "review" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Inbox className="h-3.5 w-3.5" />
              Pending Review
              {pendingAppointments.length > 0 && (
                <span className="ml-0.5 inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[0.65rem] font-bold text-white">
                  {pendingAppointments.length}
                </span>
              )}
            </button>
          </div>

          {view === "list" && (
            <button
              onClick={() => {
                setShowAddAppt(!showAddAppt);
                setSelectedPatient(null);
                setPatientMode("search");
              }}
              className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2]"
            >
              <Plus className="h-4 w-4" /> Add Appointment
            </button>
          )}
        </div>

{/* review incoming pageeeeeeeee */}
        {view === "review" && (
          <div className="space-y-4 w-full">
          

            {pendingAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
                <Inbox className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No pending requests right now</p>
                <p className="text-xs text-slate-400 mt-1">New online or desk requests will show up here for review.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {pendingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 p-5 pl-6 shadow-sm backdrop-blur-sm space-y-3"
                  >
                    <span className="absolute left-0 top-0 h-full w-1.5 bg-[#7da3b3]" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{appt.patient}</p>
                          <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${sourceBadgeClasses(appt.source)}`}>{appt.source}</span>
                        </div>
                      </div>
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {appt.phone}</p>
                      <p className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /> <span className="truncate">{appt.email}</span></p>

                      <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {appt.date} · {appt.time}</p>
                    </div>

                    <div className="text-xs font-medium text-slate-800">
                      <span className="inline-block bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                        {appt.service}
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="rounded-lg bg-slate-50/80 border border-slate-100 p-3">
                      <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        <StickyNote className="h-3 w-3" /> Notes
                      </p>
                      <p className={`text-xs leading-snug ${appt.notes ? "text-slate-600" : "text-slate-400 italic"}`}>
                        {appt.notes || "No additional notes from the patient."}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleAccept(appt.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => handleReject(appt.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MAIN APPOINTMENTS LIST ================= */}
        {view === "list" && (
        <>
        <div className="flex flex-wrap items-center gap-3 w-full">

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search patient, phone, dentist..."
              className={`${inputClass} pl-9`}
            />
          </div>

          {/* Booking Type Filter */}
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
            <select
              value={filterSource}
              onChange={(e) => handleFilterSourceChange(e.target.value as "All" | "Online" | "Walk-in")}
              className={`${inputClass} appearance-none pl-9 pr-8`}
            >
              <option value="All">All Bookings</option>
              <option value="Online">Online Bookings</option>
              <option value="Walk-in">Walk-in Bookings</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => handleFilterDateChange(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => handleFilterDateChange("")}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-1"
                title="Clear Date Filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Form Interface */}
        {showAddAppt && (
          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-md backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">New Desk Entry</h3>
              <button onClick={() => setShowAddAppt(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                <h4 className="text-xs font-semibold text-[#7da3b3] uppercase tracking-wider">Patient Details</h4>

                {/* Patient Mode Selection Tabs */}
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode("search");
                      setSelectedPatient(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      patientMode === "search" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Search className="h-3.5 w-3.5" />
                    Existing Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode("new");
                      setSelectedPatient(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                      patientMode === "new" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    New Patient
                  </button>
                </div>

                {/* Option A: Search Existing Database */}
                {patientMode === "search" && !selectedPatient && (
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-medium text-slate-600">Search Existing Patient</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type patient name..."
                        value={searchPatientQuery}
                        onChange={(e) => setSearchPatientQuery(e.target.value)}
                        className={`${inputClass} pl-9`}
                      />
                    </div>

                    {searchPatientQuery && (
                      <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg divide-y divide-slate-50">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => { setSelectedPatient(p); setSearchPatientQuery(""); }}
                              className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 flex justify-between items-center"
                            >
                              <div>
                                <span className="font-medium text-slate-900 block">{p.name}</span>
                                <span className="text-[0.68rem] text-slate-400">{p.gender} • {p.age} yrs</span>
                              </div>
                              <span className="text-slate-400">{p.phone}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 mb-2">No active record found matching "{searchPatientQuery}"</p>
                            <button
                              type="button"
                              onClick={() => {
                                setPatientMode("new");
                                setRegisterForm({ ...registerForm, firstName: searchPatientQuery });
                                setSearchPatientQuery("");
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
                            >
                              <UserPlus className="h-3 w-3" /> Register "{searchPatientQuery}" as New Patient
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {patientMode === "new" && !selectedPatient && (
                  <form onSubmit={handleQuickRegister} className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 space-y-3 pt-3">
                    <span className="mb-1 block text-md font-bold text-slate-600">Quick Registration</span>
                    <br></br>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">First Name</label>
                        <input
                          required
                          type="text"
                          placeholder="First Name"
                          value={registerForm.firstName}
                          className={inputClass}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Last Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Last Name"
                          value={registerForm.lastName}
                          className={inputClass}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Date of Birth</label>
                        <input required type="date" value={registerForm.dob} className={inputClass} onChange={(e) => handleDobChange(e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Age</label>
                        <input required type="number" min="0" placeholder="Age" value={registerForm.age} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, age: e.target.value})} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Gender</label>
                        <select value={registerForm.gender} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, gender: e.target.value})}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <label className="mb-1 block text-xs font-medium text-slate-600">Phone Number</label>
                    <input required type="tel" placeholder="Phone Number" value={registerForm.phone} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} />
                    <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                    <input required type="email" placeholder="Email Address" value={registerForm.email} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#6b92a2]"
                    >
                      <UserPlus className="h-6 w-4" /> Confirm
                    </button>
                  </form>
                )}

                {/* Selected Patient Confirmation Box */}
                {selectedPatient && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex justify-between items-center mt-2">
                    <div className="space-y-1">
                      <p className="text-[0.7rem] font-bold uppercase text-emerald-600 tracking-wider">Verified Patient Selected</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedPatient.name}</p>
                      <p className="text-xs text-slate-600 font-medium">{selectedPatient.gender} • {selectedPatient.age} yrs {selectedPatient.dob && `(DOB: ${selectedPatient.dob})`}</p>
                      <p className="text-xs flex items-center gap-1 text-slate-500"><Phone className="h-3 w-3" /> {selectedPatient.phone}</p>
                      <p className="text-xs flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" /> {selectedPatient.email}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 text-xs underline font-medium">Change</button>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddAppt} className="space-y-4">
                <h4 className="text-xs font-semibold text-[#7da3b3] uppercase tracking-wider">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Assign Dentist</span>
                    <select className={inputClass} onChange={(e) => setNewAppt({...newAppt, dentist: e.target.value})}>
                      {DENTISTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Service</span>
                    <select className={inputClass} onChange={(e) => setNewAppt({...newAppt, service: e.target.value})}>
                      {SERVICES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Date</span>
                    <input required type="date" className={inputClass} onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} />
                  </label>
                  <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Time</span>
                    <input required type="time" className={inputClass} onChange={(e) => setNewAppt({...newAppt, time: e.target.value})} />
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!selectedPatient}
                    className={`h-10 w-full rounded-xl text-xs font-semibold text-white transition-colors ${
                      selectedPatient ? "bg-[#7da3b3] hover:bg-[#6b92a2]" : "bg-slate-300 cursor-not-allowed"
                    }`}
                  >
                    Add Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Data Grid — only Confirmed appointments show here */}
        <div className="w-full overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="p-4 pl-6">Patient Name</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 pr-6">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Patient Name */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold shrink-0"> <User className="h-4 w-4" /> </div>
                        <span className="font-semibold text-slate-900">{appt.patient}</span>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {appt.phone}
                      </span>
                    </td>

                    {/* Email Column */}
                    <td className="p-4 text-xs text-slate-600 max-w-[180px] truncate">
                      <span className="flex items-center gap-1.5 truncate" title={appt.email}>
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{appt.email}</span>
                      </span>
                    </td>

                    {/* Doctor Dropdown Column */}
                    <td className="p-4">
                      <div className="relative flex items-center min-w-[150px]">
                        <Stethoscope className="absolute left-2.5 h-3.5 w-3.5 text-sky-500 pointer-events-none" />
                        <select
                          value={appt.dentist}
                          onChange={(e) => handleDentistChange(appt.id, e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-8 pr-2 py-1 text-xs font-semibold text-slate-800 outline-none hover:bg-white focus:border-sky-400 focus:bg-white transition-all cursor-pointer"
                        >
                          {DENTISTS.map((doc) => (
                            <option key={doc} value={doc}>
                              {doc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Service Column */}
                    <td className="p-4 text-xs font-medium text-slate-800">
                      <span className="inline-block bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60">
                        {appt.service}
                      </span>
                    </td>

                    {/* Origin Column */}
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${sourceBadgeClasses(appt.source)}`}>{appt.source}</span>
                    </td>

                    {/* Date & Time Column */}
                    <td className="p-4">
                      <div className="text-xs space-y-0.5 whitespace-nowrap">
                        <p className="flex items-center gap-1 text-slate-700 font-medium">
                          <Calendar className="h-3 w-3 text-slate-400" /> {appt.date}
                        </p>
                        <p className="flex items-center gap-1 text-slate-500">
                          <Clock className="h-3 w-3 text-sky-400" /> {appt.time}
                        </p>
                      </div>
                    </td>

                    {/* Attendance Column */}
                    <td className="p-4 pr-6">
                      <div className="flex items-center gap-2">
                        {appt.attendance === "Pending" ? (
                          <span className="text-slate-300 font-bold text-xs px-2">—</span>
                        ) : (
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            appt.attendance === "Checked In" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            appt.attendance === "No-Show" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {appt.attendance}
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            title="Mark Patient Checked-In"
                            onClick={() => handleAttendance(appt.id, "Checked In")}
                            className={`rounded-lg p-1 transition-colors ${
                              appt.attendance === "Checked In"
                                ? "bg-emerald-100 text-emerald-800"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            title="Mark Patient No-Show"
                            onClick={() => handleAttendance(appt.id, "No-Show")}
                            className={`rounded-lg p-1 transition-colors ${
                              appt.attendance === "No-Show"
                                ? "bg-rose-100 text-rose-800"
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-slate-400 font-medium">
                      No confirmed appointments match your active search and date filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredAppointments.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs text-slate-500">
              <div>
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + ITEMS_PER_PAGE, filteredAppointments.length)}
                </span>{" "}
                of <span className="font-semibold text-slate-700">{filteredAppointments.length}</span> appointments
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#7da3b3] text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}