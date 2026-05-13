'use client';

import Link from 'next/link';
import { signOut } from '@/src/lib/auth-client';
import { useRouter } from 'next/navigation';
import { canAccessDashboard, canAccessNpl, type AppRole } from '@/src/lib/roles';
import { ArrowRightIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

type Props = {
  role: string | null | undefined;
};

export default function UserNavigation({ role }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const isDashboardUser = canAccessDashboard(role);
  const isNplUser = canAccessNpl(role);

  return (
    <nav className="flex items-center gap-2 mt-5 md:mt-0">
      {/* Panel de gestión — solo usuarios internos */}
      {isDashboardUser && (
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
        >
          Panel de gestión
          <ArrowRightIcon className="size-3.5" />
        </Link>
      )}

      {/* Mis activos — solo clientes/agentes (no internos, ya tienen el dashboard) */}
      {isNplUser && !isDashboardUser && (
        <Link
          href="/npl"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
        >
          Mis activos
          <ArrowRightIcon className="size-3.5" />
        </Link>
      )}

      {/* Cerrar sesión — siempre visible para cualquier usuario autenticado */}
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors dark:border-white/20 dark:bg-transparent dark:text-gray-400 dark:hover:border-white/40 dark:hover:text-white"
        title="Cerrar sesión"
      >
        <ArrowLeftStartOnRectangleIcon className="size-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </nav>
  );
}
