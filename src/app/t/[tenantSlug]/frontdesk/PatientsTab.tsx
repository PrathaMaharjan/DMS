"use client";

import { useState } from "react";
import { Search, UserPlus, Phone, Mail, ShieldCheck } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";

export default function PatientsTab() {
  const [patients, setPatients] = useState([
    { id: "P-101", name: "Aayush Shrestha", phone: "9841234567", email: "aayush@gmail.com", insurance: "National Life - Plan A" },
    { id: "P-102", name: "Melina Joshi", phone: "9808765432", email: "melina.j@gmail.com", insurance: "Sagarmatha Insurance" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", email: "", insurance: "" });

  function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setPatients([...patients, { id: `P-${100 + patients.length + 1}`, ...newPatient }]);
    setShowAddPatient(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search master demographics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${inputClass} pl-9`} />
        </div>
        <button onClick={() => setShowAddPatient(!showAddPatient)} className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#6b92a2]">
          <UserPlus className="h-4 w-4" /> New Patient File
        </button>
      </div>

      {showAddPatient && (
        <form onSubmit={handleAddPatient} className="grid gap-4 rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:grid-cols-4">
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Full Name</span>
            <input required type="text" className={inputClass} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} />
          </label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Phone</span>
            <input required type="tel" className={inputClass} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} />
          </label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Email</span>
            <input required type="email" className={inputClass} onChange={(e) => setNewPatient({...newPatient, email: e.target.value})} />
          </label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Insurance</span>
            <input required type="text" className={inputClass} onChange={(e) => setNewPatient({...newPatient, insurance: e.target.value})} />
          </label>
          <div className="sm:col-span-4 flex justify-end">
            <button type="submit" className="rounded-xl bg-[#7da3b3] px-6 py-2 text-xs font-medium text-white hover:bg-[#6b92a2]">Create Master Record</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
          <div key={p.id} className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[0.7rem] font-bold tracking-wider uppercase text-slate-400">{p.id}</span>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">{p.name}</h3>
              </div>
              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[0.7rem] font-medium text-sky-700 border border-sky-100">Active File</span>
            </div>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /><span>{p.phone}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{p.email}</span></div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium text-slate-700 truncate">{p.insurance}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}