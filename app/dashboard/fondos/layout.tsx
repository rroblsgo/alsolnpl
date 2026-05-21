import { redirect } from 'next/navigation';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';

/**
 * Layout de fondos — protege TODAS las rutas bajo /dashboard/fondos/*
 * Solo usuarios con role 'admin' pueden acceder.
 */
export default async function FondosLayout({ children }: { children: React.ReactNode }) {
  await requireRole([ROLES.ADMIN]);
  return <>{children}</>;
}
