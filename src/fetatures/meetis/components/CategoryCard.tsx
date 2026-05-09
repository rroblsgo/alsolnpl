import Heading from '@/src/shared/components/typography/Heading';
import Image from 'next/image';
import { SelectCategory } from '../types/meeti.types';
import Link from 'next/link';

type Props = {
  category: SelectCategory;
};
export default function CategoryCard({ category }: Props) {
  return (
    <li>
      <Link
        href={`/categories/${category.id}`}
        className="block relative w-full size-70 overflow-hidden group cursor-pointer"
      >
        <Image
          alt={`categoría ${category.name}`}
          src={`/${category.image}`}
          width={800}
          height={600}
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-120"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-200 ease-in-out">
          <div className="flex items-center justify-center h-full gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Heading level={2} className="text-center text-white">
              {category.name}
            </Heading>
          </div>
        </div>
        <span className="sr-only">{category.name}</span>
      </Link>
    </li>
  );
}
