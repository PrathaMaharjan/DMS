"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Calendar, Users, Eye } from "lucide-react";

interface HeaderProps {
  activeTab: "appointments" | "patients" | "availability";
  setActiveTab: (tab: "appointments" | "patients" | "availability") => void;
}

// Turns "sunrise-dental-group" into "Sunrise Dental Group" as an instant
// fallback while the real org name is being fetched.
function formatSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function FrontDeskHeader({ activeTab, setActiveTab }: HeaderProps) {
  const params = useParams<{ tenantSlug: string }>();
  const tenantSlug = params?.tenantSlug ?? "";

  const [orgName, setOrgName] = useState<string>(tenantSlug ? formatSlug(tenantSlug) : "Clinic Management");

  useEffect(() => {
    if (!tenantSlug) return;

    let cancelled = false;

    async function loadOrgName() {
      try {

        const res = await axios.get(`/api/organization`, {
          params: { slug: tenantSlug },
        });
        if (!cancelled && res.data?.success && res.data.data?.organization?.name) {
          setOrgName(res.data.data.organization.name);
        }
      } catch (err) {
        console.error("Failed to load organization name", err);
        // Keep the formatted-slug fallback already set above.
      }
    }

    loadOrgName();
    return () => {
      cancelled = true;
    };
  }, [tenantSlug]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-6 border-b border-slate-900/5 pb-8 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7da3b3]">
          Front Desk 
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {orgName}
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





// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import axios from "axios";
// import { Calendar, Users, Eye, Inbox } from "lucide-react";

// interface HeaderProps {
//   activeTab: "appointments" | "patients" | "availability" | "review";
//   setActiveTab: (tab: "appointments" | "patients" | "availability" | "review") => void;
//   pendingCount?: number;
// }

// // Turns "sunrise-dental-group" into "Sunrise Dental Group" as an instant
// // fallback while the real org name is being fetched.
// function formatSlug(slug: string) {
//   return slug
//     .split("-")
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(" ");
// }

// export default function FrontDeskHeader({ activeTab, setActiveTab, pendingCount = 0 }: HeaderProps) {
//   const params = useParams<{ tenantSlug: string }>();
//   const tenantSlug = params?.tenantSlug ?? "";

//   const [orgName, setOrgName] = useState<string>(tenantSlug ? formatSlug(tenantSlug) : "Clinic Management");

//   useEffect(() => {
//     if (!tenantSlug) return;

//     let cancelled = false;

//     async function loadOrgName() {
//       try {

//         const res = await axios.get(`/api/organization`, {
//           params: { slug: tenantSlug },
//         });
//         if (!cancelled && res.data?.success && res.data.data?.organization?.name) {
//           setOrgName(res.data.data.organization.name);
//         }
//       } catch (err) {
//         console.error("Failed to load organization name", err);
//         // Keep the formatted-slug fallback already set above.
//       }
//     }

//     loadOrgName();
//     return () => {
//       cancelled = true;
//     };
//   }, [tenantSlug]);

//   return (
//     <div className="w-full flex flex-col items-center justify-center gap-6 border-b border-slate-900/5 pb-8 text-center">
//       <div>
//         <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7da3b3]">
//           Front Desk 
//         </p>
//         <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
//           {orgName}
//         </h1>
//       </div>
      
//       {/* Centered, Light Theme Navigation Container */}
//       <div className="inline-flex w-full max-w-2xl items-center gap-1 rounded-full bg-slate-100 p-1.5 shadow-md shadow-slate-200/50 border border-slate-200/60">
//         <button
//           onClick={() => setActiveTab("appointments")}
//           className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
//             activeTab === "appointments" 
//               ? "bg-[#7da3b3] text-white shadow-sm" 
//               : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
//           }`}
//         >
//           <Calendar className="h-3.5 w-3.5" />
//           Appointments
//         </button>
//         <button
//           onClick={() => setActiveTab("review")}
//           className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
//             activeTab === "review" 
//               ? "bg-[#7da3b3] text-white shadow-sm" 
//               : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
//           }`}
//         >
//           <Inbox className="h-3.5 w-3.5" />
//           Pending Review
//           {pendingCount > 0 && (
//             <span className={`inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[0.65rem] font-bold ${
//               activeTab === "review" ? "bg-white/25 text-white" : "bg-amber-500 text-white"
//             }`}>
//               {pendingCount}
//             </span>
//           )}
//         </button>
//         <button
//           onClick={() => setActiveTab("patients")}
//           className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
//             activeTab === "patients" 
//               ? "bg-[#7da3b3] text-white shadow-sm" 
//               : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
//           }`}
//         >
//           <Users className="h-3.5 w-3.5" />
//           Patients
//         </button>
//         <button
//           onClick={() => setActiveTab("availability")}
//           className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
//             activeTab === "availability" 
//               ? "bg-[#7da3b3] text-white shadow-sm" 
//               : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
//           }`}
//         >
//           <Eye className="h-3.5 w-3.5" />
//           Schedules
//         </button>
//       </div>
//     </div>
//   );
// }