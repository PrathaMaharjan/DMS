"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  User,
  Bell,
  CalendarClock,
  Clock,
  Lock,
  Mail,
  Phone,
  Save,
  Loader2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Volume2,
  Sun,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-900/10 bg-white px-3.5 py-2 text-[0.9rem] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-400";

type SectionKey = "profile" | "notifications" | "booking" | "hours";

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  newBookingAlerts: boolean;
  cancellationAlerts: boolean;
  dailySummaryEmail: boolean;
  soundOnNewBooking: boolean;
  smsReminders: boolean;
}

interface BookingSettings {
  defaultDurationMinutes: number;
  bufferMinutes: number;
  autoConfirmOnlineBookings: boolean;
  allowSameDayWalkIns: boolean;
  requirePhoneForWalkIns: boolean;
}

interface DayHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DEFAULT_PROFILE: ProfileSettings = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const DEFAULT_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  newBookingAlerts: true,
  cancellationAlerts: true,
  dailySummaryEmail: false,
  soundOnNewBooking: true,
  smsReminders: false,
};

const DEFAULT_BOOKING: BookingSettings = {
  defaultDurationMinutes: 30,
  bufferMinutes: 10,
  autoConfirmOnlineBookings: false,
  allowSameDayWalkIns: true,
  requirePhoneForWalkIns: true,
};

const DEFAULT_HOURS: DayHours[] = [
  { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
  { day: "Saturday", isOpen: true, openTime: "10:00", closeTime: "14:00" },
  { day: "Sunday", isOpen: false, openTime: "10:00", closeTime: "14:00" },
];

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#7da3b3]" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SectionKey | "password" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(DEFAULT_PASSWORD_FORM);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [booking, setBooking] = useState<BookingSettings>(DEFAULT_BOOKING);
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await axios.get("/api/settings/frontdesk").catch(() => null);
      if (res?.data?.success && res.data.data) {
        const d = res.data.data;
        if (d.profile) setProfile({ ...DEFAULT_PROFILE, ...d.profile });
        if (d.notifications) setNotifications({ ...DEFAULT_NOTIFICATIONS, ...d.notifications });
        if (d.booking) setBooking({ ...DEFAULT_BOOKING, ...d.booking });
        if (d.hours && Array.isArray(d.hours) && d.hours.length > 0) setHours(d.hours);
      }
    } catch (err) {
      console.error("Failed to load frontdesk settings:", err);
      setErrorMsg("Failed to load settings from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function updateHour(index: number, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setErrorMsg("First name and last name are required.");
      return;
    }

    setSavingSection("profile");
    try {
      const res = await axios.patch("/api/settings/frontdesk/profile", profile);
      if (res.data?.success === false) {
        setErrorMsg(res.data?.error || "Failed to update profile.");
      } else {
        setSuccessMsg("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setErrorMsg("Please fill in your current and new password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    setSavingSection("password");
    try {
      const res = await axios.post("/api/settings/frontdesk/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data?.success === false) {
        setErrorMsg(res.data?.error || "Failed to change password.");
      } else {
        setSuccessMsg("Password changed successfully!");
        setPasswordForm(DEFAULT_PASSWORD_FORM);
      }
    } catch (err: any) {
      console.error("Failed to change password:", err);
      setErrorMsg(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveNotifications() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSavingSection("notifications");
    try {
      const res = await axios.patch("/api/settings/frontdesk/notifications", notifications);
      if (res.data?.success === false) {
        setErrorMsg(res.data?.error || "Failed to save notification preferences.");
      } else {
        setSuccessMsg("Notification preferences saved!");
      }
    } catch (err: any) {
      console.error("Failed to save notifications:", err);
      setErrorMsg(err.response?.data?.error || "Failed to save notification preferences.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveBooking() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSavingSection("booking");
    try {
      const res = await axios.patch("/api/settings/frontdesk/booking", booking);
      if (res.data?.success === false) {
        setErrorMsg(res.data?.error || "Failed to save booking preferences.");
      } else {
        setSuccessMsg("Booking preferences saved!");
      }
    } catch (err: any) {
      console.error("Failed to save booking preferences:", err);
      setErrorMsg(err.response?.data?.error || "Failed to save booking preferences.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleSaveHours() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSavingSection("hours");
    try {
      const res = await axios.patch("/api/settings/frontdesk/hours", { hours });
      if (res.data?.success === false) {
        setErrorMsg(res.data?.error || "Failed to save working hours.");
      } else {
        setSuccessMsg("Working hours saved!");
      }
    } catch (err: any) {
      console.error("Failed to save working hours:", err);
      setErrorMsg(err.response?.data?.error || "Failed to save working hours.");
    } finally {
      setSavingSection(null);
    }
  }

  const sectionTabs: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" /> },
    { key: "booking", label: "Booking Preferences", icon: <CalendarClock className="h-3.5 w-3.5" /> },
    { key: "hours", label: "Working Hours", icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  const initials =
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() || "FD";

  return (
    <div className="w-full py-6">
      <div className="space-y-6 w-full">
        {/* Notifications Banners */}
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

        {successMsg && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-700">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#7da3b3] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Front Desk Settings</h2>
              <p className="text-xs text-slate-500">Manage your profile, alerts, and booking rules.</p>
            </div>
          </div>
        </div>

        {/* Section Switcher */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-slate-100 p-1">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSection(tab.key);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeSection === tab.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 shadow-lg backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[#7da3b3]" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <>
            {/* PROFILE SECTION */}
            {activeSection === "profile" && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveProfile}
                  className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7da3b3] flex items-center gap-2">
                      <User className="h-4 w-4" /> Personal Information
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        First Name *
                      </span>
                      <input
                        required
                        type="text"
                        placeholder="First Name"
                        value={profile.firstName}
                        className={inputClass}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Last Name *
                      </span>
                      <input
                        required
                        type="text"
                        placeholder="Last Name"
                        value={profile.lastName}
                        className={inputClass}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Email Address
                      </span>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={profile.email}
                          className={`${inputClass} pl-9`}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Phone Number
                      </span>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={profile.phone}
                          className={`${inputClass} pl-9`}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingSection === "profile"}
                      className="mt-4 flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors disabled:opacity-50"
                    >
                      {savingSection === "profile" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save Profile
                    </button>
                  </div>
                </form>

                {/* Change Password */}
                <form
                  onSubmit={handleChangePassword}
                  className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#7da3b3] flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Change Password
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Current Password *
                      </span>
                      <div className="relative">
                        <input
                          required
                          type={showCurrentPw ? "text" : "password"}
                          placeholder="Current Password"
                          value={passwordForm.currentPassword}
                          className={`${inputClass} pr-10`}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPw ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        New Password *
                      </span>
                      <div className="relative">
                        <input
                          required
                          type={showNewPw ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={passwordForm.newPassword}
                          className={`${inputClass} pr-10`}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-slate-600">
                        Confirm New Password *
                      </span>
                      <input
                        required
                        type={showNewPw ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        className={inputClass}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                      />
                    </label>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Use at least 8 characters with a mix of
                    letters and numbers.
                  </p>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingSection === "password"}
                      className="mt-4 flex items-center gap-1.5 rounded-full bg-[#345263] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#2a4351] transition-colors disabled:opacity-50"
                    >
                      {savingSection === "password" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm space-y-1">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7da3b3] flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Alert Preferences
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  <Toggle
                    label="New Booking Alerts"
                    description="Get notified whenever a new online or walk-in appointment comes in."
                    checked={notifications.newBookingAlerts}
                    onChange={(val) => setNotifications({ ...notifications, newBookingAlerts: val })}
                  />
                  <Toggle
                    label="Cancellation Alerts"
                    description="Get notified when a patient cancels or reschedules."
                    checked={notifications.cancellationAlerts}
                    onChange={(val) =>
                      setNotifications({ ...notifications, cancellationAlerts: val })
                    }
                  />
                  <Toggle
                    label="Daily Summary Email"
                    description="Receive a daily recap of the day's appointments each morning."
                    checked={notifications.dailySummaryEmail}
                    onChange={(val) =>
                      setNotifications({ ...notifications, dailySummaryEmail: val })
                    }
                  />
                  <Toggle
                    label="SMS Reminders to Patients"
                    description="Automatically send SMS reminders to patients ahead of their visit."
                    checked={notifications.smsReminders}
                    onChange={(val) => setNotifications({ ...notifications, smsReminders: val })}
                  />
                  <Toggle
                    label="Sound Alert on New Booking"
                    description="Play a short chime when a new appointment request arrives."
                    checked={notifications.soundOnNewBooking}
                    onChange={(val) =>
                      setNotifications({ ...notifications, soundOnNewBooking: val })
                    }
                  />
                </div>

                <div className="flex justify-end pt-4 mt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveNotifications}
                    disabled={savingSection === "notifications"}
                    className="flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors disabled:opacity-50"
                  >
                    {savingSection === "notifications" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* BOOKING PREFERENCES SECTION */}
            {activeSection === "booking" && (
              <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7da3b3] flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Booking Rules
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Default Appointment Duration
                    </span>
                    <select
                      className={inputClass}
                      value={booking.defaultDurationMinutes}
                      onChange={(e) =>
                        setBooking({ ...booking, defaultDurationMinutes: Number(e.target.value) })
                      }
                    >
                      {DURATION_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">
                      Buffer Time Between Appointments
                    </span>
                    <select
                      className={inputClass}
                      value={booking.bufferMinutes}
                      onChange={(e) =>
                        setBooking({ ...booking, bufferMinutes: Number(e.target.value) })
                      }
                    >
                      {BUFFER_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m === 0 ? "No buffer" : `${m} minutes`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  <Toggle
                    label="Auto-Confirm Online Bookings"
                    description="Skip manual review and confirm online requests automatically."
                    checked={booking.autoConfirmOnlineBookings}
                    onChange={(val) => setBooking({ ...booking, autoConfirmOnlineBookings: val })}
                  />
                  <Toggle
                    label="Allow Same-Day Walk-Ins"
                    description="Let front desk staff book walk-in patients for the current day."
                    checked={booking.allowSameDayWalkIns}
                    onChange={(val) => setBooking({ ...booking, allowSameDayWalkIns: val })}
                  />
                  <Toggle
                    label="Require Phone Number for Walk-Ins"
                    description="Make phone number mandatory when registering a walk-in patient."
                    checked={booking.requirePhoneForWalkIns}
                    onChange={(val) => setBooking({ ...booking, requirePhoneForWalkIns: val })}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveBooking}
                    disabled={savingSection === "booking"}
                    className="mt-2 flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors disabled:opacity-50"
                  >
                    {savingSection === "booking" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* WORKING HOURS SECTION */}
            {activeSection === "hours" && (
              <div className="rounded-2xl border border-slate-900/5 bg-white/90 p-6 shadow-lg backdrop-blur-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7da3b3] flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Clinic Working Hours
                  </h3>
                </div>

                <div className="space-y-2">
                  {hours.map((h, i) => (
                    <div
                      key={h.day}
                      className={`flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3 transition-colors ${
                        h.isOpen
                          ? "border-slate-200/80 bg-slate-50/60"
                          : "border-slate-100 bg-slate-50/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 w-32 shrink-0">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={h.isOpen}
                          onClick={() => updateHour(i, { isOpen: !h.isOpen })}
                          className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors ${
                            h.isOpen ? "bg-[#7da3b3]" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                              h.isOpen ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            h.isOpen ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {h.day}
                        </span>
                      </div>

                      {h.isOpen ? (
                        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                          <input
                            type="time"
                            value={h.openTime}
                            onChange={(e) => updateHour(i, { openTime: e.target.value })}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400"
                          />
                          <span className="text-xs text-slate-400">to</span>
                          <input
                            type="time"
                            value={h.closeTime}
                            onChange={(e) => updateHour(i, { closeTime: e.target.value })}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400"
                          />
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSaveHours}
                    disabled={savingSection === "hours"}
                    className="mt-2 flex items-center gap-1.5 rounded-full bg-[#7da3b3] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#6b92a2] transition-colors disabled:opacity-50"
                  >
                    {savingSection === "hours" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save Working Hours
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}