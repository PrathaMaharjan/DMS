import OrgSidebar from "./components/OrgSidebar";
export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <OrgSidebar />

     
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}