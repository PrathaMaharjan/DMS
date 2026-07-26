"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Loader2,
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
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showNoteDropdown, setShowNoteDropdown] = useState(false);
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPrescription, setNewPrescription] = useState("");
  const [newAllergiesInput, setNewAllergiesInput] = useState("");
  const [newMedicalHistoryInput, setNewMedicalHistoryInput] = useState("");

  const [patients, setPatients] = useState<TreatedPatient[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await axios.get("/api/patent");
      if (res.data?.success && res.data.data.patients) {
        const mapped: TreatedPatient[] = res.data.data.patients.map((p: any) => ({
          id: p.id,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Patient",
          phone: p.phone || "-",
          age: p.age || 0,
          gender: p.gender || "Male",
          medicalHistory: [],
          allergies: [],
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toISOString().split("T")[0] : "N/A",
          totalVisits: 1,
          history: [],
        }));
        setPatients(mapped);
      }
    } catch (err: any) {
      console.error("Failed to fetch doctor patients:", err);
      setErrorMsg("Failed to load patient records from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter patients by name, phone, or ID
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSelectPatient = async (patient: TreatedPatient) => {
    setSelectedPatient(patient);
    setShowNoteDropdown(false);

    try {
      const res = await axios.get(`/api/patent/${patient.id}`).catch(() => null);
      if (res?.data?.success && res.data.data.patient) {
        const p = res.data.data.patient;
        setSelectedPatient((prev) =>
          prev
            ? {
                ...prev,
                name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
                phone: p.phone || prev.phone,
                age: p.age || prev.age,
                gender: p.gender || prev.gender,
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error loading patient detail:", err);
    }
  };

  const handleAddTreatmentNote = async (e: React.FormEvent) => {
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
      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-sky-400 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total Treated Patients: <strong className="text-slate-800 font-semibold">{filteredPatients.length}</strong>
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-[#7da3b3]" />
          <span>Loading patient records...</span>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500 shadow-sm">
          No patient records match your criteria.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handleSelectPatient(patient)}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                selectedPatient?.id === patient.id
                  ? "border-[#7da3b3] ring-2 ring-[#7da3b3]/20"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#7da3b3] font-bold border border-sky-100">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#7da3b3] transition-colors">
                        {patient.name}
                      </h3>
                      <p className="text-[0.7rem] font-medium text-slate-400">{patient.id}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-semibold text-slate-800">{patient.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Age & Gender:</span>
                    <span className="font-medium text-slate-800">
                      {patient.age > 0 ? `${patient.age} yrs` : "N/A"} • {patient.gender}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Visit:</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {patient.lastVisit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[0.7rem]">
                <span className="inline-flex items-center gap-1 font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                  <FileText className="h-3 w-3" />
                  {patient.history.length} Record{patient.history.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-400 font-medium group-hover:text-slate-700 transition-colors">
                  View Medical Chart →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-xs shadow-sm">
          <span className="text-slate-500 font-medium">
            Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-[#7da3b3] font-bold text-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    ID: {selectedPatient.id} • {selectedPatient.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Profile Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="block text-slate-400 font-medium">Age & Gender</span>
                <span className="font-semibold text-slate-800">
                  {selectedPatient.age > 0 ? `${selectedPatient.age} yrs` : "N/A"} • {selectedPatient.gender}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Last Visit</span>
                <span className="font-semibold text-slate-800">{selectedPatient.lastVisit}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Total Visits</span>
                <span className="font-semibold text-slate-800">{selectedPatient.totalVisits}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Status</span>
                <span className="font-semibold text-emerald-600">Active Patient</span>
              </div>
            </div>

            {/* Medical History & Allergies */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 space-y-2">
                <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600" /> Allergies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.allergies.length > 0 ? (
                    selectedPatient.allergies.map((alg, i) => (
                      <span key={i} className="bg-rose-100 text-rose-800 text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full border border-rose-200">
                        {alg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No known allergies recorded.</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <History className="h-4 w-4 text-amber-600" /> Medical History
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.medicalHistory.length > 0 ? (
                    selectedPatient.medicalHistory.map((med, i) => (
                      <span key={i} className="bg-amber-100 text-amber-800 text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                        {med}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No pre-existing conditions recorded.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Add Clinical Note Button */}
            <div className="flex justify-between items-center pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-[#7da3b3]" /> Treatment History
              </h3>

              <button
                onClick={() => setShowNoteDropdown(!showNoteDropdown)}
                className="flex items-center gap-1.5 rounded-xl bg-[#7da3b3] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Add Treatment Note
              </button>
            </div>

            {/* Add Note Form */}
            {showNoteDropdown && (
              <form onSubmit={handleAddTreatmentNote} className="space-y-4 rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-xs">
                <h4 className="font-bold text-sky-900">Add Clinical Note & Prescription</h4>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Service / Procedure *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Root Canal Therapy"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Prescription (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin 500mg - 3x daily"
                      value={newPrescription}
                      onChange={(e) => setNewPrescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Clinical Notes & Findings *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter procedure details, X-ray observations, or patient feedback..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 outline-none focus:border-sky-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNoteDropdown(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#7da3b3] px-4 py-1 text-white font-semibold hover:bg-[#6b92a2]"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Treatment History List */}
            <div className="space-y-3">
              {selectedPatient.history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No treatment records on file for this patient.
                </div>
              ) : (
                selectedPatient.history.map((record) => (
                  <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#7da3b3]" /> {record.service}
                      </span>
                      <span className="text-[0.7rem] font-semibold text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> {record.date}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed">{record.notes}</p>

                    {record.prescription && (
                      <div className="mt-2 rounded-lg bg-sky-50/70 p-2.5 text-[0.75rem] border border-sky-100 text-sky-900 font-medium">
                        <strong>Prescription:</strong> {record.prescription}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedPatient(null)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close Medical File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}