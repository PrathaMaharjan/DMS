"use client";

import { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  X,
  Stethoscope
} from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const ITEMS_PER_PAGE = 8;

interface TreatmentRecord {
  id: string;
  date: string;
  time: string; 
  treatment: string;
  doctor: string; 
  notes: string;
}

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  treatmentStatus: string;
  assignedDoctor: string;
  history: TreatmentRecord[];
}

function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function PatientsTab() {
  const [patients, setPatients] = useState<Patient[]>([
    { 
      id: "P-101", 
      name: "Aayush Shrestha", 
      dob: "1998-05-14", 
      phone: "9841234567", 
      email: "aayush@gmail.com", 
      gender: "Male", 
      treatmentStatus: "In Treatment",
      assignedDoctor: "Dr. Rajesh Sharma (Orthodontist)",
      history: [
        { id: "H-1", date: "2026-02-10", time: "10:30 AM", treatment: "Braces Tightening", doctor: "Dr. Rajesh Sharma", notes: "Lower arch wire changed to 0.018 Niti." },
        { id: "H-2", date: "2026-01-05", time: "02:00 PM", treatment: "Initial Consultation & X-Ray", doctor: "Dr. Rajesh Sharma", notes: "Class II malocclusion diagnosed. Treatment plan approved." }
      ]
    },
    { 
      id: "P-102", 
      name: "Melina Joshi", 
      dob: "2001-11-20", 
      phone: "9808765432", 
      email: "melina.j@gmail.com", 
      gender: "Female", 
      treatmentStatus: "Completed",
      assignedDoctor: "Dr. Sneha Shrestha (General Dentist)",
      history: [
        { id: "H-3", date: "2025-11-15", time: "11:15 AM", treatment: "Composite Tooth Filling", doctor: "Dr. Sneha Shrestha", notes: "Restored upper right molar tooth #16." }
      ]
    },
    { 
      id: "P-103", 
      name: "Rohan Basnet", 
      dob: "1995-02-10", 
      phone: "9841999888", 
      email: "rohan@gmail.com", 
      gender: "Male", 
      treatmentStatus: "In Treatment",
      assignedDoctor: "Dr. Bikash Adhikari (Endodontist)",
      history: [
        { id: "H-4", date: "2026-03-01", time: "04:30 PM", treatment: "Root Canal Therapy (Session 1)", doctor: "Dr. Bikash Adhikari", notes: "Pulp extirpation completed. Temporary dressing placed." }
      ]
    }
  ]);

  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  
  const [newPatient, setNewPatient] = useState({ 
    firstName: "",
    lastName: "", 
    age: "",
    dob: "", 
    phone: "", 
    email: "", 
    gender: GENDER_OPTIONS[0], 
    treatmentStatus: "In Treatment",
    assignedDoctor: "Dr. Rajesh Sharma (Orthodontist)"
  });

  const [historySearch, setHistorySearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleAgeChange = (val: string) => {
    const ageNum = parseInt(val, 10);
    if (!isNaN(ageNum) && ageNum >= 0) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - ageNum;
      setNewPatient(prev => ({
        ...prev,
        age: val,
        dob: `${birthYear}-01-01`
      }));
    } else {
      setNewPatient(prev => ({ ...prev, age: val }));
    }
  };

  const handleDobChange = (val: string) => {
    const calculated = calculateAge(val);
    setNewPatient(prev => ({
      ...prev,
      dob: val,
      age: calculated > 0 ? calculated.toString() : ""
    }));
  };

  function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    const createdPatient: Patient = {
      id: `P-${100 + patients.length + 1}`,
      name: `${newPatient.firstName.trim()} ${newPatient.lastName.trim()}`,
      dob: newPatient.dob,
      phone: newPatient.phone,
      email: newPatient.email,
      gender: newPatient.gender,
      treatmentStatus: newPatient.treatmentStatus,
      assignedDoctor: newPatient.assignedDoctor,
      history: []
    };
    
    setPatients([...patients, createdPatient]);
    setShowAddPatient(false);
    setNewPatient({ 
      firstName: "",
      lastName: "",
      age: "",
      dob: "", 
      phone: "", 
      email: "", 
      gender: GENDER_OPTIONS[0], 
      treatmentStatus: "In Treatment", 
      assignedDoctor: "Dr. Rajesh Sharma (Orthodontist)" 
    });
    setCurrentPage(1); 
  }

  function toggleTreatmentStatus(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setPatients(prev =>
      prev.map(p => p.id === id ? {
        ...p,
        treatmentStatus: p.treatmentStatus === "Completed" ? "In Treatment" : "Completed"
      } : p)
    );
  }

  const toggleExpand = (id: string) => {
    if (expandedPatientId !== id) {
      setHistorySearch("");
      setFilterDate("");
    }
    setExpandedPatientId(expandedPatientId === id ? null : id);
  };

  const clearHistoryFilters = () => {
    setHistorySearch("");
    setFilterDate("");
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

  return (
    <div className="w-full space-y-6">

      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        <div className="relative w-full sm:w-110">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Name, or Phone Number" 
            value={searchQuery} 
            onChange={handleSearchChange} 
            className={`${inputClass} pl-9`} 
          />
        </div>

        <button 
          onClick={() => setShowAddPatient(!showAddPatient)} 
          className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2]"
        >
          <UserPlus className="h-4 w-4" /> Add Patient
        </button>
      </div>

      {showAddPatient && (
        <form onSubmit={handleAddPatient} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-6">
          <div className="sm:col-span-6 flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-sky-600" /> Add New Patient Record
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddPatient(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700">First Name</span>
            <input required type="text" value={newPatient.firstName} className={inputClass} onChange={(e) => setNewPatient({...newPatient, firstName: e.target.value})} placeholder="e.g. Melina" />
          </label>
          
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Last Name</span>
            <input required type="text" value={newPatient.lastName} className={inputClass} onChange={(e) => setNewPatient({...newPatient, lastName: e.target.value})} placeholder="e.g. Joshi" />
          </label>

          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Age</span>
            <input type="number" min="0" max="120" value={newPatient.age} className={inputClass} onChange={(e) => handleAgeChange(e.target.value)} placeholder="24" />
          </label>

          <label className="block sm:col-span-1">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Gender</span>
            <select className={inputClass} value={newPatient.gender} onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</span>
            <input required type="date" value={newPatient.dob} className={inputClass} onChange={(e) => handleDobChange(e.target.value)} />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Phone</span>
            <input required type="tel" value={newPatient.phone} className={inputClass} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} placeholder="98XXXXXXXX" />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Email</span>
            <input required type="email" value={newPatient.email} className={inputClass} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} placeholder="patient@gmail.com" />
          </label>

          <div className="sm:col-span-6 flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
            <button type="button" onClick={() => setShowAddPatient(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
            <button type="submit" className="rounded-xl bg-[#7da3b3] px-6 py-2 text-xs font-semibold text-white hover:bg-[#6b92a2] shadow-sm transition-colors">Add Patient</button>
          </div>
        </form>
      )}

      {/* TABLE */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1050px] w-full">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1.5fr_2fr_1.5fr_0.5fr] border-b border-slate-100 bg-slate-50/70 p-4 text-xs font-medium text-slate-500">
              <div className="pl-2">Patient ID</div>
              <div>Full Name</div>
              <div>Date of Birth</div>
              <div>Age</div>
              <div>Gender</div>
              <div>Phone Number</div>
              <div>Email Address</div>
              <div>Treatment Status</div>
              <div className="text-center">Details</div>
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-slate-100 text-sm">
              {paginatedPatients.map((p) => {
                const age = calculateAge(p.dob);
                const isExpanded = expandedPatientId === p.id;

                const filteredHistory = p.history.filter((record) => {
                  const matchesSearch = 
                    record.treatment.toLowerCase().includes(historySearch.toLowerCase()) ||
                    record.notes.toLowerCase().includes(historySearch.toLowerCase()) ||
                    record.doctor.toLowerCase().includes(historySearch.toLowerCase());

                  const matchesDate = filterDate ? record.date === filterDate : true;

                  return matchesSearch && matchesDate;
                });

                return (
                  <div key={p.id} className="transition-colors">
                    <div 
                      onClick={() => toggleExpand(p.id)} 
                      className={`grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1.5fr_2fr_1.5fr_0.5fr] items-center p-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-sky-50/30' : ''}`}
                    >
                      <div className="pl-2 font-mono text-xs font-bold text-slate-400">{p.id}</div>

                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 font-bold shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{p.name}</span>
                      </div>

                      <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {p.dob}
                      </div>

                      <div className="text-xs font-medium text-slate-700">{age} yrs</div>

                      <div className="text-xs font-medium text-slate-700">{p.gender}</div>

                      <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {p.phone}
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-1.5 truncate pr-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={(e) => toggleTreatmentStatus(p.id, e)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                            p.treatmentStatus === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {p.treatmentStatus === "Completed" ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5 text-amber-600" />
                              In Treatment
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex justify-center text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-sky-600" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/80 p-6 border-t border-b border-sky-100/60 shadow-inner">
                        <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <FileText className="h-4 w-4 text-sky-600" /> Treatment History Logs
                            </h4>
                            <span className="text-xs text-slate-400 font-medium">
                              {filteredHistory.length} of {p.history.length} Record(s)
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      
                            <div className="relative flex-1 min-w-[200px]">
                              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                              <input 
                                type="text" 
                                placeholder="Search procedures, doctors, notes..." 
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400 placeholder:text-slate-400"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span className="text-[0.7rem] font-medium text-slate-400">Date:</span>
                              <input 
                                type="date" 
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400"
                              />
                            </div>

                            {(historySearch || filterDate) && (
                              <button 
                                onClick={clearHistoryFilters}
                                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                                title="Clear filters"
                              >
                                <X className="h-3.5 w-3.5" /> Clear
                              </button>
                            )}
                          </div>

                          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {filteredHistory.length > 0 ? (
                              filteredHistory.map((record) => (
                                <div key={record.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-xs text-slate-900">{record.treatment}</span>
                                    
                                    <div className="flex items-center gap-2 text-[0.7rem] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-sky-600" /> {record.date}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-amber-600" /> {record.time}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 text-[0.75rem] font-medium text-slate-600">
                                    <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
                                    <span>{record.doctor}</span>
                                  </div>

                                  <p className="text-xs text-slate-600 pt-0.5">{record.notes}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                                {p.history.length === 0 
                                  ? "No clinical history logs recorded for this patient yet."
                                  : "No records found matching the applied filter criteria."}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredPatients.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No matching patient demographic files found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredPatients.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredPatients.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-700">{filteredPatients.length}</span> patients
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
    </div>
  );
}