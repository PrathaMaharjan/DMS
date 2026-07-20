"use client";

import { Calendar, Users, Eye } from "lucide-react";

interface HeaderProps {
  activeTab: "appointments" | "patients" | "availability";
  setActiveTab: (tab: "appointments" | "patients" | "availability") => void;
}

export default function FrontDeskHeader({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 border-b border-slate-900/5 pb-8 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7da3b3]">
          Front Desk Hub
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Clinic Management
        </h1>
      </div>
      
      {/* Centered, Light Theme Navigation Container */}
      <div className="inline-flex w-full max-w-md items-center gap-1 rounded-full bg-slate-100 p-1.5 shadow-md shadow-slate-200/50 border border-slate-200/60">
        <button
          onClick={() => setActiveTab("appointments")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === "appointments" 
              ? "bg-[#7da3b3] text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          Appointments
        </button>
        <button
          onClick={() => setActiveTab("patients")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === "patients" 
              ? "bg-[#7da3b3] text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Patients
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === "availability" 
              ? "bg-[#7da3b3] text-white shadow-sm" 
              : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Schedules
        </button>
      </div>
    </div>
  );
}