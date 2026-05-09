import EditMeeti from '@/src/fetatures/meetis/components/EditMeeti';
import { meetiService } from '@/src/fetatures/meetis/services/MeetiService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/meetis/[id]/edit'>): Promise<Metadata> {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const meeti = await meetiService.getMeetiById(id);

  return {
    title: generatePageTitle(`Editar Meeti: ${meeti.title}`),
  };
}

export default async function EditMeetiPage(
  props: PageProps<'/dashboard/meetis/[id]/edit'>
) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await props.params;
  const meeti = await meetiService.getMeetiWithPermissions(id, session.user);
  if (!meeti.context.isAdmin) throw new Error('No autorizado');
  // console.log(meeti);

  return (
    <>
      <Heading className="text-amber-500 text-center">
        Editar Meeti: {meeti.data.title}{' '}
      </Heading>
      <Link
        href="/dashboard/meetis"
        className="mt-5 block lg:inline-block text-center bg-orange-500 hover:bg-orange-600 transition-colors text-xs lg:text-xl text-white py-3 px-10 font-bold rounded-lg"
      >
        Volver a mis Meetis
      </Link>
      <EditMeeti meeti={meeti.data} />
    </>
  );
}
