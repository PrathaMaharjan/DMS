"use client";

import { useState } from "react";
import BackgroundDecorations from "../BackgroundDecorations";
import DoctorHeader, { DoctorTabType } from "./DoctorHeader";
import DoctorScheduleTab from "./DoctorScheduleTab";
import DoctorAppointmentsTab from "./DoctorAppointmentTab";
import DoctorPatientsTab from "./DoctorPatientsTab";

export default function DoctorPage() {
  const [activeTab, setActiveTab] = useState<DoctorTabType>("appointments");

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      <BackgroundDecorations />

      <div className="relative mx-auto w-full px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <DoctorHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-10">
          {activeTab === "appointments" && <DoctorAppointmentsTab />}
          {activeTab === "patients" && <DoctorPatientsTab />}
          {activeTab === "schedule" && <DoctorScheduleTab />}
        </div>
      </div>
    </section>
  );
}