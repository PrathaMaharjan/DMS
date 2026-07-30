import SuperAdminSidebar from "./components/Sidebar"; 

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
   
      <SuperAdminSidebar />

   
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}