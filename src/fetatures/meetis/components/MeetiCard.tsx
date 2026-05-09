import Heading from '@/src/shared/components/typography/Heading';
import { SelectMeeti } from '../types/meeti.types';
import Image from 'next/image';
import { displayDate } from '@/src/shared/utils/date';
import Link from 'next/link';

type Props = {
  meeti: SelectMeeti;
};

export default function MeetiCard({ meeti }: Props) {
  return (
    <div className="border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="overflow-hidden">
        <Image
          src={meeti.image}
          alt={`Imagen del Meeti ${meeti.title}`}
          width={400}
          height={600}
          className="object-cover h-72 w-full transition-transform duration-300 ease-in-out hover:scale-120"
        />
      </div>
      <div className="p-5 space-y-5">
        <p className="text-sm text-gray-600">{displayDate(meeti.date)}</p>
        <Heading level={3} className="text-2xl font-bold h-16">
          {meeti.title}
        </Heading>
        <div className="flex items-center gap-5">
          <p className="line-clamp-2">{meeti.details}</p>
        </div>
        <Link
          className="bg-orange-500 hover:bg-orange-600 transition-colors text-xl text-white py-3 px-10 mt-10 font-bold block text-center rounded"
          href={`/meetis/${meeti.id}`}
        >
          Ver Meeti
        </Link>
      </div>
    </div>
  );
}
