"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Excludes the layout if the URL path contains /admin or /frontdesk right after the tenant slug
  const isInternalDashboard = pathname 
    ? /^\/t\/[^/]+\/(admin|frontdesk|doctor)(\/|$)/.test(pathname) 
    : false;

  if (isInternalDashboard) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}