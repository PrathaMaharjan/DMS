"use client";

import { useState } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
}

interface DoctorOption {
  id: string;
  name: string;
}

interface BookingFormProps {
  clinicName: string;
  locationId: string;
  services: ServiceOption[];
  doctors: DoctorOption[];
}

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2.5 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";

export default function BookingForm({
  clinicName,
  locationId,
  services,
  doctors,
}: BookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: services[0]?.id || "",
    doctorId: doctors[0]?.id || "",
    date: "",
    time: "",
    notes: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId) {
      setErrorMsg("No clinic location configured.");
      return;
    }
    if (!form.serviceId) {
      setErrorMsg("Please select a service.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await axios.post("/api/appoments", {
        fullName: form.name,
        phone: form.phone,
        email: form.email || undefined,
        locationId: locationId,
        treatmentId: form.serviceId,
        providerId: form.doctorId || undefined,
        preferredDate: form.date,
        preferredTime: form.time,
        notes: form.notes || undefined,
        source: "online_booking",
      });

      if (res.data?.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(res.data?.error || "Failed to request appointment.");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMsg(
        err.response?.data?.error || "Failed to submit booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedServiceName =
    services.find((s) => s.id === form.serviceId)?.name || "selected service";

  return (
    <div className="mt-12">
      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {submitted ? (
        <div className="flex flex-col items-center rounded-3xl border border-slate-900/5 bg-white/90 p-10 text-center shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-sm sm:p-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">
            Appointment requested at {clinicName}
          </h2>
          <p className="mt-2 max-w-sm text-[0.95rem] text-slate-600">
            Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll reach out
            at {form.phone || form.email} to confirm your appointment for{" "}
            {selectedServiceName}.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 text-[0.9rem] font-medium text-sky-700 underline-offset-4 hover:underline"
          >
            Book another appointment
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-900/5 bg-white/90 p-8 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] backdrop-blur-sm sm:p-10"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <User className="h-3.5 w-3.5" strokeWidth={2} />
                Full name
              </span>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Full Name"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                Phone number
              </span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Phone Number"
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="Email Address (optional)"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <Stethoscope className="h-3.5 w-3.5" strokeWidth={2} />
                Service
              </span>
              <select
                required
                value={form.serviceId}
                onChange={(e) => update("serviceId", e.target.value)}
                className={inputClass}
              >
                {services.length === 0 ? (
                  <option value="">No services available</option>
                ) : (
                  services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <User className="h-3.5 w-3.5" strokeWidth={2} />
                Preferred dentist (optional)
              </span>
              <select
                value={form.doctorId}
                onChange={(e) => update("doctorId", e.target.value)}
                className={inputClass}
              >
                <option value="">Any available doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                Preferred date
              </span>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                Preferred time
              </span>
              <input
                required
                type="time"
                value={form.time}
                onChange={(e) => update("time", e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 flex items-center gap-1.5 text-[0.8rem] font-medium text-slate-600">
                Notes (optional)
              </span>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Anything we should know before your visit?"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-8 h-12 w-full overflow-hidden rounded-full border border-[#a5c5d1] sm:w-auto disabled:opacity-50"
          >
            <div className="inline-flex h-12 w-full items-center justify-center bg-[#7da3b3] px-10 text-[0.95rem] font-medium text-white transition-transform duration-300 group-hover:-translate-y-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </span>
              ) : (
                "Confirm Appointment"
              )}
            </div>

            <div className="absolute inset-0 inline-flex h-12 w-full translate-y-full items-center justify-center bg-white px-10 text-[0.95rem] font-medium text-slate-900 transition-transform duration-300 group-hover:translate-y-0">
              {loading ? "Submitting..." : "Confirm Appointment"}
            </div>
          </button>
        </form>
      )}
    </div>
  );
}
