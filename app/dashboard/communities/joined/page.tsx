import CommunityItem from '@/src/fetatures/communities/components/CommunityItem';
import { membershipService } from '@/src/fetatures/communities/services/MembershipService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const title = 'Ver mis Comunidades';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function JoinedCommunitiesPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const communities = await membershipService.getJoinedCommunities(
    session.user
  );

  return (
    <>
      <Heading className="text-amber-500 text-center">{title}</Heading>
      <Link
        href="/dashboard/communities"
        className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
      >
        Volver a mis Comunidades
      </Link>
      {communities.length ? (
        <ul
          role="list"
          className="divide-y divide-gray-100 mt-10 shadow-lg p-10"
        >
          {communities.map((community) => (
            <CommunityItem key={community.data.id} community={community} />
          ))}
        </ul>
      ) : (
        <p className="text-center mt-10 text-lg">
          No te has unido a una Comunidad aún
        </p>
      )}
    </>
  );
}
