import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import CreateCliente from '@/src/fetatures/clientes/components/CreateCliente';

export const metadata: Metadata = { title: generatePageTitle('Nuevo cliente') };

export default async function CreateClientePage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  return (
    <>
      <Heading className="text-center text-amber-500">Nuevo cliente</Heading>
      <Link href="/dashboard/clientes" className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-xl">
        ← Volver a clientes
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <CreateCliente />
      </div>
    </>
  );
}
