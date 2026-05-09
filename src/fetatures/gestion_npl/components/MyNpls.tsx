import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '../services/NplService';
import NplItem from './NplItem';
import DeleteNplDialog from './DeleteNplDialog';

export default async function MyNpls() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const npls = await nplService.listUserNpls(session.user.id);

  return (
    <>
      <DeleteNplDialog />
      {npls.length ? (
        <ul
          role="list"
          className="mt-10 divide-y divide-gray-100 rounded-lg bg-white p-8 shadow-lg"
        >
          {npls.map((npl) => (
            <NplItem key={npl.id} npl={npl} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-lg">
          No hay NPLs aún:{' '}
          <Link href="/dashboard/npl/create" className="font-bold text-orange-500">
            crea el primero
          </Link>
        </p>
      )}
    </>
  );
}
