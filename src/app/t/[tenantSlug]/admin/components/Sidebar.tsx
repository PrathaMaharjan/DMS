"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { label: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { label: "Treatments", href: "/admin/treatments", icon: CalendarDays },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-70 shrink-0 flex-col self-start bg-[#7da3b3] px-4 py-6">
   
      <div className="flex items-center gap-2 px-2">
    
        <span className="text-2xl font-semibold tracking-tight text-white">
          Chitwan Dental
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium transition-colors",
                active
                  ? "bg-white text-[#3f6274]"
                  : "text-white/85 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

    
      <div className="mt-auto space-y-1 border-t border-white/15 pt-4">


        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}