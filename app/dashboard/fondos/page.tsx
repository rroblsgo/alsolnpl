import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireDashboard } from '@/src/lib/auth-server';
import { ROLES, hasRole } from '@/src/lib/roles';
import { fondoService } from '@/src/fetatures/fondos/services/FondoService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import FondoList from '@/src/fetatures/fondos/components/FondoList';

export const metadata: Metadata = { title: generatePageTitle('Fondos') };

export default async function FondosDashboardPage() {
  const session = await requireDashboard();
  const isAdmin = hasRole(session.user.role, [ROLES.ADMIN]);

  const fondosList = await fondoService.listFondos();

  return (
    <>
      <Heading className="text-center text-amber-500">Fondos</Heading>
      {isAdmin && (
        <div className="mt-5 flex justify-end">
          <Link
            href="/dashboard/fondos/create"
            className="rounded-lg bg-orange-500 px-8 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-sm"
          >
            + Nuevo fondo
          </Link>
        </div>
      )}
      <Suspense>
        <FondoList fondos={fondosList} isAdmin={isAdmin} />
      </Suspense>
    </>
  );
}
