"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Ban, 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  Info,
  SlidersHorizontal,
  Save
} from "lucide-react";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface DateOverride {
  id: string;
  date: string;
  type: "BLOCKED" | "EXTRA_SLOTS";
  reason: string;
  slots?: TimeSlot[];
}

export default function DoctorScheduleTab() {
  const [weeklySchedule, setWeeklySchedule] = useState<DayAvailability[]>([
    { day: "Monday", enabled: true, slots: [{ id: "m1", start: "09:00", end: "17:00" }] },
    { day: "Tuesday", enabled: true, slots: [{ id: "t1", start: "09:00", end: "17:00" }] },
    { day: "Wednesday", enabled: false, slots: [] },
    { day: "Thursday", enabled: true, slots: [{ id: "th1", start: "09:00", end: "17:00" }] },
    { day: "Friday", enabled: true, slots: [{ id: "f1", start: "09:00", end: "17:00" }] },
    { day: "Saturday", enabled: true, slots: [{ id: "s1", start: "10:00", end: "14:00" }] },
    { day: "Sunday", enabled: false, slots: [] },
  ]);

  const [overrides, setOverrides] = useState<DateOverride[]>([
    {
      id: "ov-1",
      date: "2026-07-23",
      type: "BLOCKED",
      reason: "Out of Clinic"
    },
  ]);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 21));
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-23");
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const [newOverrideType, setNewOverrideType] = useState<"BLOCKED" | "EXTRA_SLOTS">("BLOCKED");
  const [newOverrideReason, setNewOverrideReason] = useState("");
  const [newOverrideStart, setNewOverrideStart] = useState("17:00");
  const [newOverrideEnd, setNewOverrideEnd] = useState("19:00");

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const toggleDayEnabled = (dayName: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          const nextState = !d.enabled;
          return {
            ...d,
            enabled: nextState,
            slots: nextState && d.slots.length === 0 ? [{ id: Date.now().toString(), start: "09:00", end: "17:00" }] : d.slots,
          };
        }
        return d;
      })
    );
  };

  const addTimeSlot = (dayName: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          return {
            ...d,
            slots: [...d.slots, { id: Date.now().toString(), start: "14:00", end: "18:00" }],
          };
        }
        return d;
      })
    );
  };

  const removeTimeSlot = (dayName: string, slotId: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayName) {
          return {
            ...d,
            slots: d.slots.filter((s) => s.id !== slotId),
          };
        }
        return d;
      })
    );
  };

  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const createdOverride: DateOverride = {
      id: `ov-${Date.now()}`,
      date: selectedDate,
      type: newOverrideType,
      reason: newOverrideReason || (newOverrideType === "BLOCKED" ? "Day Off" : "Extra Hours"),
      slots: newOverrideType === "EXTRA_SLOTS" ? [{ id: `ex-${Date.now()}`, start: newOverrideStart, end: newOverrideEnd }] : undefined,
    };

    setOverrides([...overrides.filter((o) => o.date !== selectedDate), createdOverride]);
    setShowOverrideModal(false);
    setNewOverrideReason("");
  };

  const removeOverride = (id: string) => {
    setOverrides(overrides.filter((o) => o.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#7da3b3]" /> Doctor Schedule & Availability
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure working hours and date overrides. Front Desk bookings will adjust in real-time.
          </p>
        </div>

        <button 
          onClick={() => alert("Schedule synced!")}
          className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors"
        >
          <Save className="h-4 w-4" /> Save & Sync
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Calendar & Overrides */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#7da3b3]" />
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 rounded-xl bg-slate-50/50" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isSelected = selectedDate === formattedDate;
                const override = overrides.find((o) => o.date === formattedDate);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(formattedDate)}
                    className={`relative h-10 rounded-xl font-medium transition-all flex flex-col items-center justify-center ${
                      isSelected 
                        ? "bg-[#7da3b3] text-white font-bold shadow-md" 
                        : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 border border-slate-100"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {override && (
                      <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${override.type === "BLOCKED" ? "bg-rose-500" : "bg-emerald-500"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-around pt-3 border-t border-slate-100 text-[0.7rem] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Blocked</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Extra Slots</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#7da3b3]" /> Selected</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-5 shadow-sm backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Date</h3>
                <p className="text-sm font-semibold text-slate-800">{selectedDate}</p>
              </div>
              <button
                onClick={() => setShowOverrideModal(true)}
                className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Override
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {overrides.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No active overrides for this month.</p>
              ) : (
                overrides.map((ov) => (
                  <div key={ov.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{ov.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                          ov.type === "BLOCKED" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {ov.type === "BLOCKED" ? "Blocked" : "Extra Slots"}
                        </span>
                      </div>
                      <p className="text-slate-500">{ov.reason}</p>
                    </div>
                    <button onClick={() => removeOverride(ov.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Schedule */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#7da3b3]" /> Weekly Recurring Schedule
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {weeklySchedule.map((item) => (
                <div key={item.day} className={`p-4 rounded-xl border transition-colors ${item.enabled ? "border-slate-200/80 bg-white" : "border-slate-100 bg-slate-50/50 opacity-60"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDayEnabled(item.day)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${item.enabled ? "bg-[#7da3b3]" : "bg-slate-300"}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${item.enabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                      <span className="text-xs font-bold text-slate-800 w-24">{item.day}</span>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2 justify-end">
                      {item.enabled ? (
                        item.slots.map((slot) => (
                          <div key={slot.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{slot.start} - {slot.end}</span>
                            <button onClick={() => removeTimeSlot(item.day, slot.id)} className="text-slate-400 hover:text-rose-500 ml-1 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Ban className="h-3.5 w-3.5 text-slate-300" /> Day Off
                        </span>
                      )}

                      {item.enabled && (
                        <button onClick={() => addTimeSlot(item.day)} className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-[#7da3b3] hover:text-[#7da3b3] transition-colors">
                          <Plus className="h-3 w-3" /> Shift
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 flex items-start gap-2.5 text-xs text-sky-800">
              <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <p>Overrides configured on the left calendar take priority over recurring weekly availability.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddOverride} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Override Availability for {selectedDate}</h3>
              <button type="button" onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOverrideType("BLOCKED")}
                    className={`py-2 px-3 rounded-xl font-semibold border transition-colors ${newOverrideType === "BLOCKED" ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-slate-600"}`}
                  >
                    Block Entire Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOverrideType("EXTRA_SLOTS")}
                    className={`py-2 px-3 rounded-xl font-semibold border transition-colors ${newOverrideType === "EXTRA_SLOTS" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}
                  >
                    Add Extra Hours
                  </button>
                </div>
              </div>

              {newOverrideType === "EXTRA_SLOTS" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                    <input type="time" value={newOverrideStart} onChange={(e) => setNewOverrideStart(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                    <input type="time" value={newOverrideEnd} onChange={(e) => setNewOverrideEnd(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Note</label>
                <input type="text" placeholder="e.g. Leave, Personal Emergency" value={newOverrideReason} onChange={(e) => setNewOverrideReason(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowOverrideModal(false)} className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm">Save Override</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}