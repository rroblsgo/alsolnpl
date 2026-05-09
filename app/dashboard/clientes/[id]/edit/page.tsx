import Link from 'next/link';
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import EditCliente from '@/src/fetatures/clientes/components/EditCliente';
import { clienteService } from '@/src/fetatures/clientes/services/ClienteService';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) notFound();
  const cliente = await clienteService.getCliente(clienteId);
  // const cliente = await clienteService.getCliente(Number(id));
  return { title: generatePageTitle(`Editar: ${cliente.nombre}`) };
}

export default async function EditClientePage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');
  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) notFound();
  const cliente = await clienteService.getClienteForEdit(
    clienteId,
    session.user
  );
  // const cliente = await clienteService.getClienteForEdit(Number(id), session.user);

  return (
    <>
      <Heading className="text-center text-amber-500">Editar cliente</Heading>
      <Link
        href="/dashboard/clientes"
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-xl"
      >
        ← Volver a clientes
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <EditCliente cliente={cliente} />
      </div>
    </>
  );
}
