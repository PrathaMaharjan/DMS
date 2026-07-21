"use client";

import { useState } from "react";
import {
  Search,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  History,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  Plus,
  X,
  PlusCircle,
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

  // New Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newService, setNewService] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPrescription, setNewPrescription] = useState("");

  // Mock list of patients treated by this doctor
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
  ]);

  // Filter patients by name, phone, or ID
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

    const updatedPatient = {
      ...selectedPatient,
      lastVisit: newRecord.date,
      totalVisits: selectedPatient.totalVisits + 1,
      history: [newRecord, ...selectedPatient.history],
    };

    setPatients((prev) => prev.map((p) => (p.id === selectedPatient.id ? updatedPatient : p)));
    setSelectedPatient(updatedPatient);
    setShowNoteModal(false);
    setNewService("");
    setNewNotes("");
    setNewPrescription("");
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar & Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-900/5 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#7da3b3] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold px-2">
          <span>Total My Patients:</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-900 font-bold border border-slate-200/60">
            {patients.length}
          </span>
        </div>
      </div>

      {/* Grid: Left Column Patient List | Right Column Patient History Detail */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Side: Patient Roster */}
        <div className="lg:col-span-5 space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <User className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">No patient records found</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all ${
                    isSelected
                      ? "border-[#7da3b3] bg-sky-50/40 ring-1 ring-[#7da3b3]/30"
                      : "border-slate-900/5 bg-white/90 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{patient.name}</h4>
                        <p className="text-[0.7rem] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {patient.phone} • {patient.age}y/o {patient.gender}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "text-[#7da3b3] translate-x-0.5" : "text-slate-300"}`} />
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[0.68rem] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" /> Last visit: {patient.lastVisit}
                    </span>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {patient.totalVisits} visit{patient.totalVisits > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Medical History View */}
        <div className="lg:col-span-7">
          {selectedPatient ? (
            <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-full bg-[#7da3b3] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} years old • Phone: {selectedPatient.phone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowNoteModal(true)}
                  className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
                >
                  <PlusCircle className="h-4 w-4" /> Add Note
                </button>
              </div>

              {/* Medical Alerts (Allergies & History) */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-amber-50/60 border border-amber-200/60 p-3 space-y-1">
                  <p className="font-bold text-amber-800 flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Allergies
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPatient.allergies.map((allergy, i) => (
                      <span key={i} className="bg-amber-100/80 text-amber-900 font-semibold px-2 py-0.5 rounded-md text-[0.68rem]">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1">
                  <p className="font-bold text-slate-700 flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider">
                    <Stethoscope className="h-3.5 w-3.5 text-slate-500" /> Medical History
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPatient.medicalHistory.map((cond, i) => (
                      <span key={i} className="bg-white text-slate-700 font-semibold border border-slate-200 px-2 py-0.5 rounded-md text-[0.68rem]">
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Timeline */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-[#7da3b3]" /> Treatment History
                </h4>

                <div className="relative border-l-2 border-slate-100 pl-4 space-y-5 ml-2">
                  {selectedPatient.history.map((record) => (
                    <div key={record.id} className="relative group">
                      {/* Dot on timeline */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-[#7da3b3] ring-4 ring-white" />

                      <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-[#7da3b3]" /> {record.service}
                          </span>
                          <span className="text-[0.68rem] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {record.date}
                          </span>
                        </div>

                        <div>
                          <p className="font-semibold text-slate-600 text-[0.7rem]">Clinical Notes:</p>
                          <p className="text-slate-700 mt-0.5 leading-relaxed">{record.notes}</p>
                        </div>

                        {record.prescription && (
                          <div className="rounded-lg bg-sky-50/80 border border-sky-100 p-2.5 mt-2">
                            <p className="font-bold text-sky-900 text-[0.68rem] flex items-center gap-1">
                              <FileText className="h-3 w-3 text-sky-600" /> Rx / Prescription:
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
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-16 text-center h-full flex flex-col items-center justify-center">
              <FileText className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">Select a Patient</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click on any patient from the left list to review their medical history and past treatment notes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Treatment Note Modal */}
      {showNoteModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddTreatmentNote} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">New Treatment Note — {selectedPatient.name}</h3>
              <button type="button" onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service / Procedure</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaling & Polishing, Root Canal Stage 1"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#7da3b3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Observations</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details of procedure performed, patient symptoms, findings..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#7da3b3]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescription / Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg - 1 tablet every 8 hours"
                  value={newPrescription}
                  onChange={(e) => setNewPrescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-[#7da3b3]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowNoteModal(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm">
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}