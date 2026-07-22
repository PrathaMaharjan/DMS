"use client";

import { useState } from "react";
import {
  Search,
  User,
  Calendar,
  FileText,
  History,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  X,
  PlusCircle,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

export interface TreatmentRecord {
  id: string;
  date: string; // YYYY-MM-DD
  service: string;
  notes: string;
  prescription?: string;
}

export interface TreatedPatient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  medicalHistory: string[];
  allergies: string[];
  lastVisit: string;
  totalVisits: number;
  history: TreatmentRecord[];
}

export default function DoctorPatientsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<TreatedPatient | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showNoteDropdown, setShowNoteDropdown] = useState(false);
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPrescription, setNewPrescription] = useState("");
  const [newAllergiesInput, setNewAllergiesInput] = useState("");
  const [newMedicalHistoryInput, setNewMedicalHistoryInput] = useState("");

  const [patients, setPatients] = useState<TreatedPatient[]>([
    {
      id: "PAT-001",
      name: "Aarav Sharma",
      phone: "9841000000",
      age: 34,
      gender: "Male",
      medicalHistory: ["Hypertension"],
      allergies: ["Penicillin"],
      lastVisit: "2026-07-21",
      totalVisits: 3,
      history: [
        {
          id: "TR-101",
          date: "2026-07-21",
          service: "Dental Checkup & Cleaning",
          notes: "Mild gingivitis detected near lower right molars. Cleaned and applied fluoride coating.",
          prescription: "Chlorhexidine Mouthwash 0.12% - Use twice daily for 7 days.",
        },
        {
          id: "TR-088",
          date: "2026-03-15",
          service: "Cavity Filling",
          notes: "Composite filling on tooth #14. Patient tolerated procedure well.",
        },
      ],
    },
    {
      id: "PAT-002",
      name: "Sita Adhikari",
      phone: "9851012345",
      age: 28,
      gender: "Female",
      medicalHistory: ["None"],
      allergies: ["None"],
      lastVisit: "2026-06-10",
      totalVisits: 1,
      history: [
        {
          id: "TR-092",
          date: "2026-06-10",
          service: "Initial Consultation",
          notes: "Evaluated for root canal procedure. X-rays taken.",
        },
      ],
    },
    {
      id: "PAT-003",
      name: "Maya Gurung",
      phone: "9812345678",
      age: 42,
      gender: "Female",
      medicalHistory: ["Asthma"],
      allergies: ["Latex"],
      lastVisit: "2026-05-02",
      totalVisits: 2,
      history: [
        {
          id: "TR-074",
          date: "2026-05-02",
          service: "Scaling & Polishing",
          notes: "Routine tartar removal completed.",
        },
      ],
    },
    {
      id: "PAT-004",
      name: "Rohan Shrestha",
      phone: "9801122334",
      age: 50,
      gender: "Male",
      medicalHistory: ["Diabetes Type 2"],
      allergies: ["Sulfa Drugs"],
      lastVisit: "2026-04-18",
      totalVisits: 4,
      history: [
        {
          id: "TR-061",
          date: "2026-04-18",
          service: "Periodontal Evaluation",
          notes: "Gum pocket depths measured. Prescribed specialized rinse.",
        },
      ],
    },
    {
      id: "PAT-005",
      name: "Pooja Karki",
      phone: "9860554433",
      age: 23,
      gender: "Female",
      medicalHistory: ["None"],
      allergies: ["Dust"],
      lastVisit: "2026-03-29",
      totalVisits: 1,
      history: [
        {
          id: "TR-055",
          date: "2026-03-29",
          service: "Tooth Extraction",
          notes: "Extracted impacted lower right wisdom tooth under local anesthesia.",
        },
      ],
    },
    {
      id: "PAT-006",
      name: "Bikash Thapa",
      phone: "9849988776",
      age: 38,
      gender: "Male",
      medicalHistory: ["High Cholesterol"],
      allergies: ["Aspirin"],
      lastVisit: "2026-02-14",
      totalVisits: 5,
      history: [
        {
          id: "TR-041",
          date: "2026-02-14",
          service: "Crown Placement",
          notes: "Permanent porcelain crown fitted on tooth #19.",
        },
      ],
    },
  ]);

  // Filter patients by name, phone, or ID
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectPatient = (patient: TreatedPatient) => {
    setSelectedPatient(patient);
    setShowNoteDropdown(false);
  };

  const handleAddTreatmentNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newService || !newNotes) return;

    const newRecord: TreatmentRecord = {
      id: `TR-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      service: newService,
      notes: newNotes,
      prescription: newPrescription || undefined,
    };

    const parsedAllergies = newAllergiesInput
      ? newAllergiesInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const updatedAllergies = Array.from(
      new Set([...selectedPatient.allergies, ...parsedAllergies])
    );

    const parsedHistory = newMedicalHistoryInput
      ? newMedicalHistoryInput.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const updatedMedicalHistory = Array.from(
      new Set([...selectedPatient.medicalHistory, ...parsedHistory])
    );

    const updatedPatient = {
      ...selectedPatient,
      allergies: updatedAllergies.length > 0 ? updatedAllergies : selectedPatient.allergies,
      medicalHistory: updatedMedicalHistory.length > 0 ? updatedMedicalHistory : selectedPatient.medicalHistory,
      lastVisit: newRecord.date,
      totalVisits: selectedPatient.totalVisits + 1,
      history: [newRecord, ...selectedPatient.history],
    };

    setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
    setSelectedPatient(updatedPatient);
    setShowNoteDropdown(false);
    setNewService("");
    setNewNotes("");
    setNewPrescription("");
    setNewAllergiesInput("");
    setNewMedicalHistoryInput("");
  };

  return (
    <div className="w-full space-y-6 text-slate-800">
      {/* Search & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, Phone, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#7da3b3] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Total Patients:</span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-900 font-bold border border-slate-200">
            {patients.length}
          </span>
        </div>
      </div>

      {/* Grid: Left Patient Table/Roster | Right Medical Record Detail */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Front-Desk Style Patient Roster */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden min-h-[580px]">
          <div>
            {/* Table Header Style */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">
              <span>Patient Directory</span>
              <span>Last Visit / Service</span>
            </div>

            {/* Patient Cards List */}
            <div className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No records found</p>
                </div>
              ) : (
                paginatedPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const latestService = patient.history[0]?.service || "General Checkup";

                  return (
                    <div
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className={`group cursor-pointer p-3.5 transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-sky-50/60 border-l-4 border-l-[#7da3b3]"
                          : "hover:bg-slate-50 border-l-4 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 font-bold group-hover:bg-sky-100 group-hover:text-sky-700 transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#7da3b3] transition-colors">
                              {patient.name}
                            </h4>
                            <span className="text-[0.62rem] font-semibold text-slate-400">
                              ({patient.id})
                            </span>
                          </div>
                          <p className="text-[0.68rem] text-slate-500 mt-0.5">
                            {patient.phone} • {patient.age}y/o {patient.gender}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-[0.68rem] font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                          <Stethoscope className="h-3 w-3 text-sky-600" />
                          <span className="truncate max-w-[100px]">{latestService}</span>
                        </div>
                        <span className="text-[0.62rem] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" /> {patient.lastVisit}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Front-Desk Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs">
            <span className="text-[0.7rem] text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{filteredPatients.length > 0 ? startIndex + 1 : 0}</strong> to{" "}
              <strong className="text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredPatients.length)}
              </strong>{" "}
              of <strong className="text-slate-800">{filteredPatients.length}</strong>
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Medical History & Notes View */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
              {/* Header Info Banner */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 shrink-0 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} yrs • Phone: {selectedPatient.phone}
                    </p>
                  </div>
                </div>

                {/* Dropdown Toggle Button */}
                <button
                  onClick={() => setShowNoteDropdown(!showNoteDropdown)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#7da3b3] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
                >
                  <PlusCircle className="h-4 w-4" /> Add Note
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showNoteDropdown ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Inline Add Note Form */}
              {showNoteDropdown && (
                <form
                  onSubmit={handleAddTreatmentNote}
                  className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 shadow-sm space-y-3 transition-all duration-300"
                >
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                    <h4 className="text-xs font-bold text-sky-900">New Clinical Entry</h4>
                    <button
                      type="button"
                      onClick={() => setShowNoteDropdown(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Service / Procedure</label>
                      <input
                        type="text"
                        required
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#7da3b3]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Observations</label>
                      <textarea
                        required
                        rows={2}
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#7da3b3]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Prescription / Instructions (Optional)</label>
                      <input
                        type="text"
                        value={newPrescription}
                        onChange={(e) => setNewPrescription(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#7da3b3]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Add Allergies</label>
                        <input
                          type="text"
                          value={newAllergiesInput}
                          onChange={(e) => setNewAllergiesInput(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#7da3b3]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Add Medical History</label>
                        <input
                          type="text"
                          value={newMedicalHistoryInput}
                          onChange={(e) => setNewMedicalHistoryInput(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-[#7da3b3]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
                    <button
                      type="button"
                      onClick={() => setShowNoteDropdown(false)}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2]"
                    >
                      Save Record
                    </button>
                  </div>
                </form>
              )}

              {/* Alerts & History Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-amber-50/50 border border-amber-200/60 p-3 space-y-1">
                  <p className="font-bold text-amber-800 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Allergies
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPatient.allergies.map((allergy, i) => (
                      <span key={i} className="bg-amber-100/80 text-amber-900 font-semibold px-2 py-0.5 rounded text-[0.68rem]">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1">
                  <p className="font-bold text-slate-700 flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider">
                    <Stethoscope className="h-3.5 w-3.5 text-sky-600" /> Medical History
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPatient.medicalHistory.map((cond, i) => (
                      <span key={i} className="bg-white text-slate-700 font-semibold border border-slate-200 px-2 py-0.5 rounded text-[0.68rem]">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-[#7da3b3]" /> Treatment History
                </h4>

                <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                  {selectedPatient.history.map((record) => (
                    <div key={record.id} className="relative group">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#7da3b3] ring-4 ring-white" />

                      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-sky-600" /> {record.service}
                          </span>
                          <span className="text-[0.68rem] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {record.date}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-slate-500 text-[0.68rem]">Clinical Notes:</p>
                          <p className="text-slate-700 mt-0.5 leading-relaxed">{record.notes}</p>
                        </div>

                        {record.prescription && (
                          <div className="rounded-lg bg-sky-50 border border-sky-100 p-2 mt-2">
                            <p className="font-bold text-sky-900 text-[0.68rem] flex items-center gap-1">
                              <FileText className="h-3 w-3 text-sky-600" /> Prescription:
                            </p>
                            <p className="text-sky-800 mt-0.5 font-medium">{record.prescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-16 text-center h-full flex flex-col items-center justify-center min-h-[580px]">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">Select a Patient</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click on any patient row from the directory on the left to view their detailed medical history and records.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}