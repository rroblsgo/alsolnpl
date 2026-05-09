import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import NplList from '@/src/fetatures/gestion_npl/components/NplList';

const title = 'Gestión de NPLs';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function NplDashboardPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const npls = await nplService.listUserNpls(session.user.id);

  return (
    <>
      <Heading className="text-center text-amber-500">{title}</Heading>
      <div className="mt-5 flex justify-end">
        <Link
          href="/dashboard/npl/create"
          className="rounded-lg bg-orange-500 px-8 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-sm"
        >
          + Crear NPL
        </Link>
      </div>
      <Suspense>
        <NplList npls={npls} />
      </Suspense>
    </>
  );
}
