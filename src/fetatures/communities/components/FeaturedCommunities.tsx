import Heading from '@/src/shared/components/typography/Heading';
import { communityService } from '../services/CommunityService';
import CommunityCard from './CommunityCard';

export default async function FeaturedCommunities() {
  const communities = await communityService.getFeaturedCommunities();

  return (
    <section className="bg-slate-100 max-w-7xl mx-auto py-10 space-y-5 px-5 lg:px-0">
      <Heading level={2} className="text-center">
        Comunidades Destacadas
      </Heading>
      {communities.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10 ">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-lg text-gray-600">
          No hay comunidades destacadas en este momento.
        </p>
      )}
    </section>
  );
}
