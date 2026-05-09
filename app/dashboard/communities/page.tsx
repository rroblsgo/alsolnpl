import DeleteCommunityModal from '@/src/fetatures/communities/components/DeleteCommunityModal';
import MyCommunities from '@/src/fetatures/communities/components/MyCommunities';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';

const title = 'Administra tus Comunidades';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default function CommunitiesPage() {
  return (
    <>
      <Heading className="text-amber-500 text-center">{title}</Heading>
      <div className="flex justify-between flex-col lg:flex-row">
        <Link
          href="/dashboard/communities/create"
          className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
        >
          Crear una Comunidad
        </Link>
        <Link
          href="/dashboard/communities/joined"
          className="mt-5 block lg:inline-block text-center bg-pink-500 hover:bg-pink-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
        >
          Comunidades a las que te uniste
        </Link>
      </div>

      <MyCommunities />

      <DeleteCommunityModal />
    </>
  );
}
