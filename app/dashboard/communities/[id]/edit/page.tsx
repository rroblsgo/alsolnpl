import Heading from '@/components/typography/Heading';
import EditCommunity from '@/src/fetatures/communities/components/EditCommunity';
import { communityService } from '@/src/fetatures/communities/services/CommunityService';
import { requireAuth } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata(
  props: PageProps<'/dashboard/communities/[id]/edit'>
): Promise<Metadata> {
  const { id } = await props.params;
  const result = await communityService.getCommunity(id);

  return {
    title: generatePageTitle(`Editar Comunidad - ${result.name}`),
    description: result.description,
    openGraph: {
      title: 'Compartir Comunidad',
      images: [
        {
          url: result.image,
        },
      ],
    },
  };
}

export default async function EditCommunityPage(
  props: PageProps<'/dashboard/communities/[id]/edit'>
) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await props.params;
  const community = await communityService.getCommunityDetails(
    id,
    session.user
  );
  if (!community?.permissions?.canEdit) redirect(`/dashboard/communities`);

  return (
    <>
      <Heading className="text-amber-500 text-center">
        Editar Comunidad: {community.data.name}
      </Heading>
      <Link
        href="/dashboard/communities"
        className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
      >
        Volver a mis Comunidades
      </Link>
      <EditCommunity community={community.data} />
    </>
  );
}
