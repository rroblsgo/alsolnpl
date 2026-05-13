import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';
import CreateUserForm from '@/src/fetatures/auth/components/CreateUserForm';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: generatePageTitle('Crear usuario'),
};

/**
 * /dashboard/users/create
 *
 * Solo accesible para role 'admin'. El layout del dashboard ya garantiza
 * que el usuario es interno (DASHBOARD_ROLES), pero esta page añade
 * una segunda comprobación específica de role admin.
 *
 * Si un usuario interno con role distinto de 'admin' llega aquí
 * (por URL directa), requireRole lo redirige a /unauthorized.
 */
export default async function CreateUserPage() {
  await requireRole([ROLES.ADMIN]);

  return (
    <div className="max-w-lg mx-auto">
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
            <UserPlusIcon className="size-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Crear nuevo usuario
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El usuario recibirá un email de verificación
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta del formulario */}
      <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <CreateUserForm />
      </div>

      {/* Nota sobre roles */}
      <div className="mt-6 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Roles disponibles
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          {[
            { role: 'admin',     desc: 'Acceso total al dashboard' },
            { role: 'legal',     desc: 'Dashboard · NPL y tareas legales' },
            { role: 'comercial', desc: 'Dashboard · NPL y clientes' },
            { role: 'ver_only',  desc: 'Dashboard · solo lectura' },
            { role: 'cliente',   desc: 'Acceso a activos /npl' },
            { role: 'agente',    desc: 'Acceso a activos /npl' },
          ].map(({ role, desc }) => (
            <div key={role} className="flex items-baseline gap-1.5">
              <code className="font-mono text-blue-700 dark:text-blue-400 shrink-0">
                {role}
              </code>
              <span className="text-gray-500 dark:text-gray-400 truncate">
                — {desc}
              </span>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-600">
          Actualiza el campo <code className="font-mono">role</code> en la tabla{' '}
          <code className="font-mono">users</code> tras la verificación del email.
        </p>
      </div>
    </div>
  );
}
