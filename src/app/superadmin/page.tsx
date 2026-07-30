"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CreditCard,
  Activity,
  Plus,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from "lucide-react";

// Types for Mock / API Data
interface ClinicSummary {
  id: string;
  name: string;
  slug: string;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  doctorsCount: number;
  patientsCount: number;
  joinedDate: string;
}

export default function SuperAdminDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Example data (replace with API call e.g., via axios.get("/api/superadmin/stats"))
  const clinics: ClinicSummary[] = [
    {
      id: "1",
      name: "Chitwan Dental Clinic",
      slug: "chitwan-dental",
      plan: "PRO",
      status: "ACTIVE",
      doctorsCount: 8,
      patientsCount: 1420,
      joinedDate: "Jan 12, 2026",
    },
    {
      id: "2",
      name: "Kathmandu Care Dental",
      slug: "ktm-care",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      doctorsCount: 15,
      patientsCount: 3890,
      joinedDate: "Feb 01, 2026",
    },
    {
      id: "3",
      name: "Pokhara Smile Center",
      slug: "pokhara-smile",
      plan: "BASIC",
      status: "PENDING",
      doctorsCount: 2,
      patientsCount: 120,
      joinedDate: "Mar 10, 2026",
    },
    {
      id: "4",
      name: "Everest Dental Care",
      slug: "everest-dental",
      plan: "PRO",
      status: "SUSPENDED",
      doctorsCount: 5,
      patientsCount: 890,
      joinedDate: "Nov 20, 2025",
    },
  ];

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 p-6 md:p-10">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight md:text-3xl">
            Platform Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor clinic subscriptions, tenant health, and overall system usage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/tenants/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3f6274] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#32505f] transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Clinic</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Clinics
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7da3b3]/15 text-[#3f6274]">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">28</span>
            <span className="text-xs font-semibold text-emerald-600">+12% this mo</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Doctors
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7da3b3]/15 text-[#3f6274]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">142</span>
            <span className="text-xs font-semibold text-emerald-600">+8 new</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              MRR (Revenue)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7da3b3]/15 text-[#3f6274]">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">$12,450</span>
            <span className="text-xs font-semibold text-emerald-600">+18% vs last mo</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              System Uptime
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">99.98%</span>
            <span className="text-xs font-semibold text-slate-500">All services healthy</span>
          </div>
        </div>
      </div>

      {/* Main Content: Clinics List */}
      <div className="mt-10 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Table Header & Search */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Clinics</h2>
            <p className="text-xs text-slate-500">
              Manage subscriptions, access portals, or view tenant details.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinic name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#3f6274] focus:outline-none focus:ring-1 focus:ring-[#3f6274]"
            />
          </div>
        </div>

        {/* Table Component */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 uppercase text-[10px] font-semibold tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Clinic Details</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Doctors / Patients</th>
                <th className="px-6 py-3.5">Joined Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name & Slug */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{clinic.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          /t/{clinic.slug}
                        </span>
                      </div>
                    </td>

                    {/* Subscription Plan */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {clinic.plan}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-4">
                      {clinic.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      )}
                      {clinic.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 text-[11px]">
                          <AlertCircle className="h-3 w-3" /> Pending
                        </span>
                      )}
                      {clinic.status === "SUSPENDED" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 text-[11px]">
                          <AlertCircle className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Stats */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">
                          {clinic.doctorsCount} Doctors
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {clinic.patientsCount} Patients
                        </span>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-slate-500">{clinic.joinedDate}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/t/${clinic.slug}/admin`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          title="Visit Tenant Portal"
                        >
                          <span>Manage</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No clinics found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}