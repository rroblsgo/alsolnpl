import Image from 'next/image';
import { SelectCommunity } from '../types/community.types';
import Heading from '@/src/shared/components/typography/Heading';
import Link from 'next/link';
import { pluralize } from '@/src/shared/utils/string';

type Props = {
  community: Omit<SelectCommunity, 'createdAt' | 'createdBy'> & {
    membersCount?: string;
  };
};

export default function CommunityCard({ community }: Props) {
  return (
    <div className="border border-slate-200 bg-white hover:shadow-lg transition-shadow">
      <div className="overflow-hidden">
        <Image
          src={community.image}
          width={800}
          height={600}
          alt={`Imagen de la comunidad ${community.name}`}
          className="object-cover h-60 w-full transition-transform duration-300 ease-in-out hover:scale-120"
          priority
        />
      </div>
      <div className="p-5 space-y-3">
        <Heading level={3} className="font-bold text-2xl">
          {community.name}
        </Heading>
        {community.membersCount && (
          <p className="text-gray-600 text-sm">
            {community.membersCount}{' '}
            {pluralize('Miembro', +community.membersCount)}{' '}
          </p>
        )}
        <p className="line-clamp-2">{community.description}</p>
        <Link
          href={`/communities/${community.id}`}
          className="bg-orange-500 hover:bg-orange-600 transition-colors text-xl text-white py-3 px-10 mt-10 font-bold block text-center rounded"
        >
          Ver Comunidad
        </Link>
      </div>
    </div>
  );
}
