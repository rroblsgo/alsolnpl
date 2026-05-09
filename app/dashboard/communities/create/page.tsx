import CreateCommunity from '@/src/fetatures/communities/components/CreateCommunity';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const title = 'Crear una Comunidad';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function CreateCommunityPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  return (
    <>
      <Heading className="text-amber-500 text-center">{title}</Heading>
      <Link
        href="/dashboard/communities"
        className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
      >
        Volver a mis Comunidades
      </Link>
      <CreateCommunity />
    </>
  );
}
