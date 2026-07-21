"use client";

import { useState } from "react";
import { Clock, Plus, Check, X, UserPlus, Search, Filter, Phone, Mail, User } from "lucide-react";

const SERVICES = ["Routine Checkup & Cleaning", "Teeth Whitening", "Root Canal Treatment", "Dental Implants", "Braces & Aligners", "Emergency Care"];
const DENTISTS = ["Pratha Maharjan", "Sophan Shrestha", "Suprasidhhi Pradhan", "Pragun Maskey"];
const inputClass = "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";

// Mock global patient database for verification
const EXISTING_PATIENTS = [
  { id: "P-101", name: "Aayush Shrestha", phone: "9841234567", email: "aayush@gmail.com" },
  { id: "P-102", name: "Melina Joshi", phone: "9808765432", email: "melina.j@gmail.com" },
  { id: "P-103", name: "Rohan Basnet", phone: "9841999888", email: "rohan@gmail.com" },
];

export default function AppointmentsTab() {
  // Appointments containing both online submissions and desk entries with explicit contact parameters
  const [appointments, setAppointments] = useState([
    { id: "1", patient: "Aayush Shrestha", phone: "9841234567", email: "aayush@gmail.com", dentist: "Pratha Maharjan", service: "Routine Checkup", time: "09:00", source: "Online", status: "Pending" },
    { id: "2", patient: "Melina Joshi", phone: "9808765432", email: "melina.j@gmail.com", dentist: "Sophan Shrestha", service: "Braces & Aligners", time: "10:30", source: "Online", status: "Confirmed" },
    { id: "3", patient: "Rohan Basnet", phone: "9841999888", email: "rohan@gmail.com", dentist: "Pragun Maskey", service: "Emergency Care", time: "13:00", source: "Walk-in", status: "Confirmed" },
  ]);

  const [patientsList, setPatientsList] = useState(EXISTING_PATIENTS);
  const [filterSource, setFilterSource] = useState<"All" | "Online" | "Walk-in">("All");

  // Booking Form State
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [searchPatientQuery, setSearchPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string; phone: string; email: string } | null>(null);
  const [newAppt, setNewAppt] = useState({ dentist: DENTISTS[0], service: SERVICES[0], date: "", time: "" });

  // Quick Register State
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", phone: "", email: "", insurance: "Self Pay" });

  // Filtered list of registered patients for search
  const filteredPatients = searchPatientQuery
    ? patientsList.filter(p => p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()))
    : [];

  function handleQuickRegister(e: React.FormEvent) {
    e.preventDefault();
    const newId = `P-${100 + patientsList.length + 1}`;
    const brandNewPatient = { id: newId, ...registerForm };

    setPatientsList([...patientsList, brandNewPatient]);
    setSelectedPatient({ id: newId, name: registerForm.name, phone: registerForm.phone, email: registerForm.email });
    setShowQuickRegister(false);
    setSearchPatientQuery("");
  }

  function handleAddAppt(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) return alert("Please select or register a patient first.");

    setAppointments([
      ...appointments,
      {
        id: String(appointments.length + 1),
        patient: selectedPatient.name,
        phone: selectedPatient.phone,
        email: selectedPatient.email,
        ...newAppt,
        source: "Walk-in",
        status: "Confirmed"
      }
    ]);

    // Reset layout
    setShowAddAppt(false);
    setSelectedPatient(null);
    setSearchPatientQuery("");
    setRegisterForm({ name: "", phone: "", email: "", insurance: "Self Pay" });
  }

  // Handle Accept Appointment Status
  function handleAccept(id: string) {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, status: "Confirmed" } : appt))
    );
  }

  // Handle Reject Appointment Status
  function handleReject(id: string) {
    setAppointments(prev =>
      prev.map(appt => (appt.id === id ? { ...appt, status: "Rejected" } : appt))
    );
  }

  const filteredAppointments = appointments.filter(appt =>
    filterSource === "All" ? true : appt.source === filterSource
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
              {(["All", "Online", "Walk-in"] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setFilterSource(src)}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    filterSource === src ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {src} Bookings
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setShowAddAppt(!showAddAppt); setShowQuickRegister(false); setSelectedPatient(null); }}
            className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2]"
          >
            <Plus className="h-4 w-4" /> Desk Walk-In Booking
          </button>
        </div>

        {/* Main Form Interface */}
        {showAddAppt && (
          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-md backdrop-blur-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">New Desk Entry (Walk-In)</h3>
              <button onClick={() => setShowAddAppt(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column: Patient Lookup / Registration Verification */}
              <div className="space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                <h4 className="text-xs font-semibold text-slate-700 uppercase">1. Patient Verification</h4>

                {!selectedPatient && !showQuickRegister && (
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-600">Search Existing Database</label>
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

                    {/* Dropdown Results */}
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
                              <span className="font-medium text-slate-900">{p.name}</span>
                              <span className="text-slate-400">{p.phone}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 mb-2">No active record found matching "{searchPatientQuery}"</p>
                            <button
                              type="button"
                              onClick={() => { setShowQuickRegister(true); setRegisterForm({ ...registerForm, name: searchPatientQuery }); }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7da3b3] hover:underline"
                            >
                              <UserPlus className="h-3 w-3" /> Quick-Register as New Patient
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Selected Notice */}
                {selectedPatient && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[0.7rem] font-bold uppercase text-emerald-600 tracking-wider">Verified Record Linked</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedPatient.name}</p>
                      <p className="text-xs flex items-center gap-1 text-slate-500"><Phone className="h-3 w-3" /> {selectedPatient.phone}</p>
                      <p className="text-xs flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" /> {selectedPatient.email}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 text-xs underline">Change</button>
                  </div>
                )}

                {/* Inline Registration Subform */}
                {showQuickRegister && (
                  <form onSubmit={handleQuickRegister} className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-3">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700">Quick Demographics Capture</span><button type="button" onClick={() => setShowQuickRegister(false)} className="text-slate-400 text-xs">Cancel</button></div>
                    <input required type="text" placeholder="Full Name" value={registerForm.name} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
                    <input required type="tel" placeholder="Phone Number" value={registerForm.phone} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})} />
                    <input required type="email" placeholder="Email Address" value={registerForm.email} className={inputClass} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />
                    <button type="submit" className="w-full h-9 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800">Generate Master File & Select</button>
                  </form>
                )}
              </div>

              {/* Right Column: Time Slot & Provider Grid */}
              <form onSubmit={handleAddAppt} className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-700 uppercase">2. Appointment Allocations</h4>
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
                    Commit Entry to Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Data Grid */}
        <div className="overflow-hidden rounded-2xl border border-slate-900/5 bg-white/90 shadow-lg backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <th className="p-4">Patient Details</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Treatment</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-slate-900">{appt.patient}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs space-y-0.5 text-slate-600">
                        <p className="flex items-center gap-1 font-medium"><Phone className="h-3 w-3 text-slate-400" /> {appt.phone}</p>
                        <p className="flex items-center gap-1 text-slate-400"><Mail className="h-3 w-3 text-slate-400" /> {appt.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{appt.dentist}</td>
                    <td className="p-4 text-slate-600">{appt.service}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${
                        appt.source === "Online" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>{appt.source}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
                        <Clock className="h-3 w-3 text-sky-400" /> {appt.time}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        appt.status === "Checked In" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        appt.status === "Confirmed" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                        appt.status === "Rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        appt.status === "No-Show" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>{appt.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {/* Accept Button */}
                        <button
                          title="Accept / Confirm Appointment"
                          onClick={() => handleAccept(appt.id)}
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        {/* Reject Button */}
                        <button
                          title="Reject Appointment"
                          onClick={() => handleReject(appt.id)}
                          className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs text-slate-400 font-medium">No system records match this origin perspective criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}