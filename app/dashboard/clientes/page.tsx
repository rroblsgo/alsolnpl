import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { clienteService } from '@/src/fetatures/clientes/services/ClienteService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import ClienteList from '@/src/fetatures/clientes/components/ClienteList';

export const metadata: Metadata = { title: generatePageTitle('Clientes') };

export default async function ClientesDashboardPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const clientesList = await clienteService.listUserClientes(session.user.id);

  return (
    <>
      <Heading className="text-center text-amber-500">Clientes</Heading>
      <div className="mt-5 flex justify-end">
        <Link
          href="/dashboard/clientes/create"
          className="rounded-lg bg-orange-500 px-8 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-sm"
        >
          + Nuevo cliente
        </Link>
      </div>
      <Suspense>
        <ClienteList clientes={clientesList} />
      </Suspense>
    </>
  );
}
