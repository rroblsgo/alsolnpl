import { requireDashboard } from '@/src/lib/auth-server';
import DashboardPanel from '@/src/shared/components/dashboard/DashboardPanel';

/**
 * Layout del dashboard — Capa 2 de protección.
 *
 * requireDashboard() valida sesión + role contra la DB.
 * Si el usuario tiene sesión pero role insuficiente → redirige a /unauthorized.
 * Si no hay sesión → redirige a /auth/login.
 *
 * Esto es la barrera de seguridad real, no salteable con una cookie falsa.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Validación segura: sesión real + role en DASHBOARD_ROLES
  await requireDashboard();

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
