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


  const isInternalDashboard = pathname 
    ? /^\/t\/[^/]+\/(admin|frontdesk|doctor|organization)(\/|$)/.test(pathname) 
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