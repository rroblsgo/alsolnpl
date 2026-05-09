import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import CreateNpl from '@/src/fetatures/gestion_npl/components/CreateNpl';

const title = 'Crear un NPL';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function CreateNplPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  return (
    <>
      <Heading className="text-center text-amber-500">{title}</Heading>
      <Link
        href="/dashboard/npl"
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-center text-xs font-bold text-white transition-colors hover:bg-orange-600 lg:text-xl"
      >
        Volver a NPLs
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <CreateNpl />
      </div>
    </>
  );
}
