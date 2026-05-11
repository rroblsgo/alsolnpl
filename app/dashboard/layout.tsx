import DashboardPanel from '@/src/shared/components/dashboard/DashboardPanel';

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardPanel />
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
