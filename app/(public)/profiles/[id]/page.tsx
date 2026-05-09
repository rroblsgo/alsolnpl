import CommunityCard from '@/src/fetatures/communities/components/CommunityCard';
import MeetiCard from '@/src/fetatures/meetis/components/MeetiCard';
import { profileService } from '@/src/fetatures/profile/services/ProfileService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';

const getProfileDetailsCached = cache(async (id: string) => {
  return await profileService.getProfileDetails(id);
});

export async function generateMetadata({
  params,
}: PageProps<'/profiles/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileDetailsCached(id);

  return {
    title: generatePageTitle(`Perfil de:${profile?.name}`),
    openGraph: {
      title: `Perfil ${profile?.name}`,
      siteName: 'Perfil',
      images: [
        {
          url: profile?.image ?? `${process.env.APP_URL}/default.jpg`,
          width: 1200,
          height: 630,
          alt: `Imagen del Perfil ${profile?.name}`,
        },
      ],
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Perfil ${profile?.name}`,
      description: 'Te invito a que veas mi Perfil',
      images: [profile?.image ?? `${process.env.APP_URL}/default.jpg`],
    },
  };
}

export default async function ProfilePage({
  params,
}: PageProps<'/profiles/[id]'>) {
  const { id } = await params;
  const profile = await getProfileDetailsCached(id);
  if (!profile) return notFound();

  return (
    <>
      <main className="max-w-7xl mx-auto mt-10 space-y-5 px-5 lg:p-0 ">
        <div className="space-y-7 mt-10">
          <div className="relative size-64 mx-auto aspect-square overflow-hidden rounded-full border border-gray-400">
            <Image
              src={profile.image ?? '/default.jpg'}
              alt="Imagen Perfil"
              width={600}
              height={600}
              className="object-cover size-64"
              priority
            />
          </div>
          <Heading level={2} className="text-center">
            {profile.name}
          </Heading>
          <p className="text-gray-500 text-center text-lg">{profile.bio}</p>
        </div>
      </main>
      {profile.communities.length > 0 && (
        <section className="max-w-7xl mx-auto mt-10 space-y-5 px-5 lg:p-0">
          <Heading level={2} className="text-center">
            Comunidades de {profile.name}
          </Heading>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 mt-10">
            {profile.communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        </section>
      )}
      {profile.meetis.length > 0 && (
        <section className="max-w-7xl mx-auto mt-10 space-y-5 px-5 lg:p-0 pb-20">
          <Heading level={2} className="text-center">
            Próximos Meetis organizados por {profile.name}
          </Heading>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 mt-10">
            {profile.meetis.map((meeti) => (
              <MeetiCard key={meeti.id} meeti={meeti} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
