'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Logo from '../ui/Logo';
import NotificationsPanel from './NotificationsPanel';
import UserMenu from './UserMenu';
import MobileSidebar from './MobileSidebar';
import DashboardNavigation from './DashboardNavigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function DashboardPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, isPending } = useSession();
  if (isPending) return null;

  return (
    <>
      {/* Sidebar móvil (drawer) */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/70 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Cerrar menú</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            <MobileSidebar />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Sidebar fijo escritorio */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 dark:border-white/10 dark:bg-gray-950">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-white/10">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          <DashboardNavigation />
        </div>
      </div>

      {/* Topbar */}
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-gray-950 lg:pl-80 lg:pr-6">
        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-400 lg:hidden"
        >
          <span className="sr-only">Abrir menú</span>
          <Bars3Icon aria-hidden="true" className="size-5" />
        </button>

        {/* Separador vertical móvil */}
        <div
          aria-hidden="true"
          className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden"
        />

        {/* Título móvil */}
        <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white lg:hidden">
          AlsolNPL
        </span>

        {/* Zona derecha */}
        <div className="ml-auto flex items-center gap-x-4">
          {/* Email usuario (solo escritorio) */}
          <span className="hidden text-sm text-gray-500 dark:text-gray-400 lg:block">
            {session?.user?.email}
          </span>

          {/* Notificaciones */}
          {session?.user?.id && (
            <NotificationsPanel userId={session.user.id} />
          )}

          {/* Menú usuario */}
          {session && <UserMenu userId={session.user?.id} />}
        </div>
      </div>
    </>
  );
}
