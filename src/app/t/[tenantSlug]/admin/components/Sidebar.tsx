"use client";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "", icon: LayoutDashboard, exact: true },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Treatments", href: "/treatments", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ tenantSlug: string }>();
  const router = useRouter();

  const adminRoot = `/t/${params.tenantSlug}/admin`;

  async function handleLogout() {
    await axios.post(
      "/api/auth/logout",
      {},
      { withCredentials: true }
    );
    router.push(`/login`);
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-70 shrink-0 flex-col self-start bg-[#7da3b3] px-4 py-6">

      <div className="flex items-center gap-2 px-2">

        <span className="text-2xl font-semibold tracking-tight text-white">
          Chitwan Dental
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
          const fullHref = `${adminRoot}${href}`;
          const active = exact
            ? pathname === fullHref
            : pathname === fullHref || pathname?.startsWith(`${fullHref}/`);

          return (
            <Link
              key={fullHref}
              href={fullHref}
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
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9rem] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar