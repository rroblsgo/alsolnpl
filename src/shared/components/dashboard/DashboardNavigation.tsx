'use client';

import { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames, currentPath } from '@/src/shared/utils/ui';
import {
  HomeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  UserPlusIcon,
  BriefcaseIcon,
  TableCellsIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Sparkles } from 'lucide-react';

const navigation = [
  { name: 'Panel principal', href: '/dashboard', icon: HomeIcon },
  { name: 'Gestión NPL', href: '/dashboard/npl', icon: BuildingOffice2Icon },
  { name: 'Clientes', href: '/dashboard/clientes', icon: UserGroupIcon },
  { name: 'Tareas', href: '/dashboard/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Documentos', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Notificaciones', href: '/dashboard/notifications', icon: BellIcon },
  // Operaciones: visible para todos los usuarios internos
  {
    name: 'Operaciones',
    href: '/dashboard/operaciones',
    icon: TableCellsIcon,
    allRoles: true,
  },
  { name: 'Enrichments', href: '/dashboard/enrichments', icon: Sparkles },
];

const adminNavigation = [
  // Fondos: solo admin
  { name: 'Fondos', href: '/dashboard/fondos', icon: BriefcaseIcon },
];

const accountNavigation = [
  { name: 'Mi perfil', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Seguridad', href: '/dashboard/security', icon: Cog6ToothIcon },
];

type Props = { role: string | null | undefined };

export default function DashboardNavigation({ role }: Props) {
  const pathname = usePathname();
  const isAdmin = role === 'admin';

  const linkClass = (href: string) =>
    classNames(
      currentPath(href, pathname)
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
      'group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors'
    );

  const iconClass = (href: string) =>
    classNames(
      currentPath(href, pathname)
        ? 'text-blue-700 dark:text-blue-300'
        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white',
      'size-5 shrink-0 transition-colors'
    );

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {/* ── Plataforma ──────────────────────────────────────────────── */}
        <li>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Plataforma
          </p>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href as Route}
                  className={linkClass(item.href)}
                >
                  <item.icon
                    aria-hidden="true"
                    className={iconClass(item.href)}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* ── Administración (solo admin) ──────────────────────────────── */}
        {isAdmin && (
          <li>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
              Administración
            </p>
            <ul role="list" className="-mx-2 space-y-1">
              {adminNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href as Route}
                    className={linkClass(item.href)}
                  >
                    <item.icon
                      aria-hidden="true"
                      className={iconClass(item.href)}
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}

        {/* ── Cuenta ──────────────────────────────────────────────────── */}
        <li className="mt-auto pb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Cuenta
          </p>
          <ul role="list" className="-mx-2 space-y-1">
            {accountNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href as Route}
                  className={classNames(
                    currentPath(item.href, pathname)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300',
                    'group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors'
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-gray-400"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <>
                <li>
                  <Link
                    href={'/dashboard/users/create' as Route}
                    className={classNames(
                      currentPath('/dashboard/users/create', pathname)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300',
                      'group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors'
                    )}
                  >
                    <UserPlusIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-gray-400"
                    />
                    Crear usuario
                  </Link>
                </li>
                <li>
                  <Link
                    href={'/dashboard/users/roles' as Route}
                    className={classNames(
                      currentPath('/dashboard/users/roles', pathname)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300',
                      'group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors'
                    )}
                  >
                    <UsersIcon
                      aria-hidden="true"
                      className="size-5 shrink-0 text-gray-400"
                    />
                    Gestión de roles
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="mt-4 px-2">
            <p className="text-[11px] text-gray-400 dark:text-gray-600">
              AlsolNPL · Alsol Inmobiliaria
            </p>
          </div>
        </li>
      </ul>
    </nav>
  );
}
