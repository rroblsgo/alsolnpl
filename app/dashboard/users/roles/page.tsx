import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/24/outline';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES, APP_ROLES } from '@/src/lib/roles';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { listUsersForRoleManagement } from '@/src/fetatures/auth/services/UserRoleRepository';
import UserRoleList from '@/src/fetatures/auth/components/UserRoleList';

export const metadata: Metadata = {
  title: generatePageTitle('Gestión de roles'),
};

export default async function UserRolesPage() {
  await requireRole([ROLES.ADMIN]);

  const users = await listUsersForRoleManagement();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cabecera */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <ArrowLeftIcon className="size-4" />
          Volver al panel
        </Link>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2.5">
            <UsersIcon className="size-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestión de roles
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {users.length} usuario{users.length !== 1 ? 's' : ''} registrado
              {users.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Lista interactiva */}
      <UserRoleList users={users} />

      {/* Leyenda de roles */}
      <div className="mt-8 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Referencia de roles
        </p>
        <dl className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-2 text-xs">
          {APP_ROLES.map((r) => {
            const desc: Record<string, string> = {
              admin: 'Acceso total al dashboard + administración',
              legal: 'Dashboard · NPL y tareas legales',
              comercial: 'Dashboard · NPL y clientes',
              ver_only: 'Dashboard · solo lectura',
              cliente: 'Acceso a activos públicos /npl',
              agente: 'Acceso a activos públicos /npl',
              user: 'Sin acceso a zonas protegidas (por defecto)',
            };
            return (
              <div key={r} className="flex items-baseline gap-1.5">
                <code className="font-mono text-blue-700 dark:text-blue-400 shrink-0">
                  {r}
                </code>
                <span className="text-gray-500 dark:text-gray-400">
                  — {desc[r]}
                </span>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
