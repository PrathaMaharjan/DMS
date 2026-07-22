"use client";

import { useState } from "react";
import {
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Coffee,
  ArrowRight,
} from "lucide-react";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
}

interface DateOverride {
  id: string;
  date: string;
  type: "FULL_DAY_OFF" | "BREAK_HOURS";
  reason?: string;
  slots?: TimeSlot[];
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DoctorScheduleTab() {
  const [overrides, setOverrides] = useState<DateOverride[]>([
    {
      id: "ov-1",
      date: "2026-07-23",
      type: "BREAK_HOURS",
      reason: "Lunch & Personal Break",
      slots: [{ id: "b1", start: "12:00", end: "13:00" }],
    },
  ]);

  // Default to July 2026
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-22");

  // Availability / Break Controls state
  const [customizeByHours, setCustomizeByHours] = useState(true);
  const [breakIntervals, setBreakIntervals] = useState<TimeSlot[]>([
    { id: "b-1", start: "09:00", end: "12:00" },
    { id: "b-2", start: "13:00", end: "18:00" },
  ]);

  // Date Calculation Helpers
  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const addBreakInterval = () => {
    setBreakIntervals((prev) => [
      ...prev,
      { id: `b-${Date.now()}`, start: "13:00", end: "14:00" },
    ]);
  };

  const removeBreakInterval = (id: string) => {
    setBreakIntervals((prev) => prev.filter((i) => i.id !== id));
  };

  const updateBreakInterval = (
    id: string,
    field: "start" | "end",
    value: string
  ) => {
    setBreakIntervals((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSaveClosingPeriod = () => {
    const createdOverride: DateOverride = {
      id: `ov-${Date.now()}`,
      date: selectedDate,
      type: customizeByHours ? "BREAK_HOURS" : "FULL_DAY_OFF",
      reason: customizeByHours
        ? "Break / Unavailable Hours"
        : "Full Day Closed",
      slots: customizeByHours ? breakIntervals : undefined,
    };

    setOverrides((prev) => [
      ...prev.filter((o) => o.date !== selectedDate),
      createdOverride,
    ]);
  };

  const removeOverride = (id: string) => {
    setOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  const monthDays = daysInMonth(currentDate);
  const startDay = firstDayOfMonth(currentDate); // 0 = Sun, 3 = Wed for July 2026

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Calendar & Time Settings Card */}
        <div className="lg:col-span-7 rounded-2xl border border-[#7da3b3]/20 bg-white/90 p-6 shadow-sm backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-sky-600" /> Select Timing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose a date from the calendar to modify hours.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#7da3b3] bg-[#7da3b3]/10 px-3 py-1 rounded-full border border-[#7da3b3]/20">
              Selected:{" "}
              <span className="font-bold text-slate-900">{selectedDate}</span>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="bg-[#f4fafc] p-5 rounded-2xl border border-[#7da3b3]/15 space-y-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-800">
              <span>
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 text-slate-500 hover:text-[#7da3b3] bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 text-slate-500 hover:text-[#7da3b3] bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Weekday Headers (Standard Sunday -> Saturday Layout) */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {/* Padding offset days before start of month */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9" />
              ))}

              {/* Month Days */}
              {Array.from({ length: monthDays }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDate = `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                
                const isSelected = selectedDate === formattedDate;
                const hasOverride = overrides.some(
                  (o) => o.date === formattedDate
                );

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDate(formattedDate)}
                    className={`relative h-9 w-full rounded-xl flex items-center justify-center font-medium transition-all ${
                      isSelected
                        ? "bg-[#7da3b3] text-white font-bold shadow-md scale-105"
                        : "text-slate-700 bg-white border border-slate-200/60 hover:border-[#7da3b3] hover:text-[#7da3b3]"
                    }`}
                  >
                    {dayNum}
                    {hasOverride && !isSelected && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-[#7da3b3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inline Closing Controls */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Customize by hours
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCustomizeByHours(!customizeByHours)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  customizeByHours ? "bg-[#7da3b3]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    customizeByHours ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {customizeByHours ? (
              <div className="space-y-3">
                {breakIntervals.map((interval) => (
                  <div key={interval.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => removeBreakInterval(interval.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="flex-1 flex items-center gap-2 bg-[#f4fafc] border border-[#7da3b3]/20 rounded-xl px-3 py-2 text-xs">
                      <span className="text-slate-400 font-medium">From</span>
                      <input
                        type="time"
                        value={interval.start}
                        onChange={(e) =>
                          updateBreakInterval(
                            interval.id,
                            "start",
                            e.target.value
                          )
                        }
                        className="bg-transparent font-bold text-slate-800 outline-none"
                      />
                    </div>

                    <ArrowRight className="h-4 w-4 text-[#7da3b3] shrink-0" />

                    <div className="flex-1 flex items-center gap-2 bg-[#f4fafc] border border-[#7da3b3]/20 rounded-xl px-3 py-2 text-xs">
                      <span className="text-slate-400 font-medium">To</span>
                      <input
                        type="time"
                        value={interval.end}
                        onChange={(e) =>
                          updateBreakInterval(
                            interval.id,
                            "end",
                            e.target.value
                          )
                        }
                        className="bg-transparent font-bold text-slate-800 outline-none"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={addBreakInterval}
                    className="p-2 border border-[#7da3b3]/30 rounded-xl bg-white hover:bg-[#f4fafc] text-[#7da3b3] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                Full Day marked as <strong>Closed / Unavailable</strong> for{" "}
                <strong>{selectedDate}</strong>.
              </div>
            )}

            <button
              onClick={handleSaveClosingPeriod}
              className="w-full py-3 bg-[#7da3b3] text-white rounded-xl text-xs font-bold hover:bg-[#6b92a2] transition-colors shadow-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Active Overrides Side-Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#7da3b3]/20 bg-white/90 p-5 shadow-sm backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Coffee className="h-4 w-4 text-[#7da3b3]" /> Active Breaks & Unavailabilities
            </h3>

            <div className="space-y-2 pt-1">
              {overrides.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No closing or break periods added yet.
                </p>
              ) : (
                overrides.map((ov) => (
                  <div
                    key={ov.id}
                    className="p-3.5 rounded-xl border border-[#7da3b3]/20 bg-[#f4fafc]/60 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {ov.date}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                            ov.type === "FULL_DAY_OFF"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-[#7da3b3]/15 text-[#6b92a2] border border-[#7da3b3]/30"
                          }`}
                        >
                          {ov.type === "FULL_DAY_OFF"
                            ? "Closed Full Day"
                            : "Break Hours"}
                        </span>
                      </div>
                      <button
                        onClick={() => removeOverride(ov.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {ov.slots && ov.slots.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ov.slots.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#7da3b3]/20 rounded-lg text-[0.7rem] text-slate-700 font-medium"
                          >
                            <Clock className="h-3 w-3 text-[#7da3b3]" />{" "}
                            {s.start} - {s.end}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}