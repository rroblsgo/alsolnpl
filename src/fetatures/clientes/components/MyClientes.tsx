import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { clienteService } from '../services/ClienteService';
import ClienteItem from './ClienteItem';
import DeleteClienteDialog from './DeleteClienteDialog';

export default async function MyClientes() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const clientesList = await clienteService.listUserClientes(session.user.id);

  return (
    <>
      <DeleteClienteDialog />
      {clientesList.length ? (
        <ul role="list" className="mt-10 divide-y divide-gray-100 rounded-lg bg-white p-8 shadow-lg">
          {clientesList.map((cliente) => (
            <ClienteItem key={cliente.id} cliente={cliente} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-lg">
          No hay clientes aún:{' '}
          <Link href="/dashboard/clientes/create" className="font-bold text-orange-500">
            crea el primero
          </Link>
        </p>
      )}
    </>
  );
}
