import DashboardPanel from '@/components/dashboard/DashboardPanel';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div>
        <DashboardPanel />
        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
