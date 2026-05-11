'use client';

import { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames, currentPath } from '@/shared/utils/ui';
import {
  HomeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BellIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

export const navigation = [
  {
    name: 'Panel principal',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Gestión NPL',
    href: '/dashboard/npl',
    icon: BuildingOffice2Icon,
  },
  {
    name: 'Clientes',
    href: '/dashboard/clientes',
    icon: UserGroupIcon,
  },
  {
    name: 'Tareas',
    href: '/dashboard/tasks',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Documentos',
    href: '/dashboard/documents',
    icon: DocumentTextIcon,
  },
  {
    name: 'Notificaciones',
    href: '/dashboard/notifications',
    icon: BellIcon,
  },
];

const secondaryNavigation = [
  {
    name: 'Mi perfil',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
  },
  {
    name: 'Seguridad',
    href: '/dashboard/security',
    icon: Cog6ToothIcon,
  },
];

export default function DashboardNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {/* Navegación principal */}
        <li>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Plataforma
          </p>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href as Route}
                  className={classNames(
                    currentPath(item.href, pathname)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                    'group flex gap-x-3 rounded-lg p-2 text-sm font-medium transition-colors'
                  )}
                >
                  <item.icon
                    aria-hidden="true"
                    className={classNames(
                      currentPath(item.href, pathname)
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white',
                      'size-5 shrink-0 transition-colors'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>

        {/* Configuración */}
        <li className="mt-auto pb-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Cuenta
          </p>
          <ul role="list" className="-mx-2 space-y-1">
            {secondaryNavigation.map((item) => (
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
          </ul>

          {/* Branding pie de sidebar */}
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
