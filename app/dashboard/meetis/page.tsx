import DeleteMeetiDialog from '@/src/fetatures/meetis/components/DeleteMeetiDialog';
import MeetiDropdownMenu from '@/src/fetatures/meetis/components/MeetiDropdownMenu';
import { meetiService } from '@/src/fetatures/meetis/services/MeetiService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { formatMeetiDate } from '@/src/shared/utils/date';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { pluralize } from '@/src/shared/utils/string';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const title = 'Administra tus Meetis';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};
export default async function MeetisPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const meetis = await meetiService.getUpcomingMeetisByUser(session.user);

  return (
    <>
      <Heading className="text-amber-500 text-center">{title}</Heading>
      <Link
        href="/dashboard/meetis/create"
        className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
      >
        Crear un Meeti
      </Link>
      {meetis.length ? (
        <ul
          role="list"
          className="divide-y divide-gray-100 dark:divide-white/5 mt-10 shadow-lg p-10"
        >
          {meetis.map((meeti) => {
            const { id, title, image, date, time } = meeti.data;
            return (
              <li className="flex justify-between gap-x-6 py-5" key={id}>
                <div className="flex items-center min-w-0 gap-x-4">
                  <Image
                    alt={`Imagen de Meeti: ${title}`}
                    src={image}
                    width={400}
                    height={250}
                    className="w-40"
                    priority
                  />
                  <div className="min-w-0 flex-auto">
                    <Link
                      href={`/meetis/${id}`}
                      className="hover:underline font-bold text-lg"
                      target="_blank"
                    >
                      {title}
                    </Link>
                    <p className="text-gray-600 text-sm">
                      {formatMeetiDate(date, time)}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {meeti.attendanceCount}{' '}
                      {pluralize('Asistente', meeti.attendanceCount)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-x-6">
                  {meeti.context.isAdmin && (
                    <MeetiDropdownMenu meeti={meeti.data} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center mt-10 text-lg">
          No Hay Meetis Aún{' - '}
          <Link
            href={'/dashboard/meetis/create'}
            className="text-orange-500 font-bold"
          >
            Comienza Creando Uno{' '}
          </Link>
        </p>
      )}
      <DeleteMeetiDialog />
    </>
  );
}
