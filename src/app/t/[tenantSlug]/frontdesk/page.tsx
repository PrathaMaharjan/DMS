"use client";

import { useState } from "react";
import BackgroundDecorations from "./BackgroundSecorations";
import FrontDeskHeader from "./FrontDeskHeader";
import AppointmentsTab from "./AppointmentsTab";
import PatientsTab from "./PatientsTab";
import DoctorAvailabilityTab from "./DoctorAvailabilityTab";

export default function FrontDeskPage() {
  const [activeTab, setActiveTab] = useState<"appointments" | "patients" | "availability">("appointments");

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-white text-slate-900">
      <BackgroundDecorations />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <FrontDeskHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-10">
          {activeTab === "appointments" && <AppointmentsTab />}
          {activeTab === "patients" && <PatientsTab />}
          {activeTab === "availability" && <DoctorAvailabilityTab />}
        </div>
      </div>
    </section>
  );
}