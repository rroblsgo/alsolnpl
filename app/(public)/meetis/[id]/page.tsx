import { DynamicMeetiLocation } from '@/src/fetatures/meetis/components/DynamicMeetiLocation';
import { meetiService } from '@/src/fetatures/meetis/services/MeetiService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { displayDate } from '@/shared/utils/date';
import OrganizerCard from '@/src/fetatures/meetis/components/OrganizerCard';
import { requireAuth } from '@/src/lib/auth-server';
import AttendanceToggleButton from '@/src/fetatures/meetis/components/AttendanceToggleButton';

export async function generateMetadata({
  params,
}: PageProps<'/meetis/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const meeti = await meetiService.getMeetiById(id);
  return {
    title: generatePageTitle(`${meeti.title}`),
    openGraph: {
      title: `Meeti ${meeti.title}`,
      siteName: 'Meeti',
      images: [
        {
          url: meeti.image,
          width: 1200,
          height: 630,
          alt: `Imagen del Meeti ${meeti.title}`,
        },
      ],
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Meeti ${meeti.title}`,
      description: 'Únete al Meeti',
      images: [meeti.image],
    },
  };
}

export default async function MeetiPage(props: PageProps<'/meetis/[id]'>) {
  const { session } = await requireAuth();

  const { id } = await props.params;
  const meeti = await meetiService.getMeetiWithDetails(id, session?.user);
  if (meeti.context.isPastMeeti)
    throw new Error('Este Meeti no está disponible');

  // console.log(meeti);

  const { virtual: isVirtual, location } = meeti.data;

  return (
    <>
      <nav className="py-5 border-b border-gray-200 px-5 lg:px-0">
        <div className="max-w-7xl mx-auto flex flex-col gap-3  items-start lg:flex-row lg:justify-between lg:gap-0">
          <p className=" text-gray-600">
            Categoría:{' '}
            <Link
              href={`/categories/${meeti.data.category.id}`}
              className="font-black"
            >
              {meeti.data.category.name}
            </Link>
          </p>
          <p className=" text-gray-600">
            Comunidad:{' '}
            <Link
              href={`/communities/${meeti.data.community.id}`}
              className="font-black"
            >
              {meeti.data.community.name}
            </Link>
          </p>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto my-10 flex justify-end">
        {!session?.user && (
          /* Si el usuario no está autenticado, mostramos un enlace para que se loguee */
          <p className="font-bold border border-orange-500 p-2 rounded">
            Confirma tu asistencia obteniendo una cuenta. Es gratis.
          </p>
        )}

        {meeti.permissions && !meeti.context.isAdmin && (
          <AttendanceToggleButton
            meetiId={meeti.data.id}
            permissions={meeti.permissions}
          />
        )}
      </div>

      <Heading className="text-center mt-10 text-amber-500">
        {meeti.data.title}
      </Heading>
      <main className="max-w-7xl mx-auto grid grid-cols-1 gap-5 lg:grid-cols-3 p-5 lg:px-0 mt-10">
        <section className="lg:col-span-2">
          <Image
            src={meeti.data.image}
            alt={`Imagen del Meeti ${meeti.data.title}`}
            width={800}
            height={600}
            priority
          />
          <p className="mt-5 text-lg">{meeti.data.details}</p>
        </section>

        <aside className="bg-slate-100 rounded-2xl">
          {isVirtual && (
            <p className="bg-orange-400 m-5 rounded-lg text-center p-3 text-white font-bold">
              Este Meeti es Virtual
            </p>
          )}
          {location && !isVirtual && (
            <DynamicMeetiLocation
              address={location.address}
              lat={location.lat}
              lng={location.lng}
              placeName={location.placeName}
            />
          )}
          <section className="space-y-5 p-10 ">
            <Heading level={2} className="font-black">
              Información Meeti
            </Heading>
            <p>
              <span className="font-bold">Fecha:</span>{' '}
              {displayDate(meeti.data.date)}
            </p>
            <p>
              <span className="font-bold">Hora:</span> {meeti.data.time} horas
            </p>
            <OrganizerCard organizer={meeti.data.admin} />
          </section>
        </aside>
      </main>
    </>
  );
}
