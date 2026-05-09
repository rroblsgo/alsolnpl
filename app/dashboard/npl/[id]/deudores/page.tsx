import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import { NplPolicy } from '@/src/fetatures/gestion_npl/policies/NplPolicy';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import Heading from '@/src/shared/components/typography/Heading';
import DeudorList from '@/src/fetatures/npl_deudores/components/DeudorList';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));
  return { title: generatePageTitle(`Deudores — ${npl.tituloOperacion}`) };
}

export default async function NplDeudoresPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));

  if (!NplPolicy.canEdit(session.user, npl)) redirect('/dashboard/npl');

  return (
    <>
      <Heading className="text-center text-amber-500">
        Deudores — {npl.tituloOperacion}
      </Heading>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/dashboard/npl/${npl.id}`}
          className="inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Volver al NPL
        </Link>
        <Link
          href={`/dashboard/npl/${npl.id}/deudores/create`}
          className="inline-block rounded-lg bg-orange-500 px-6 py-2.5 text-center text-sm font-bold text-white hover:bg-orange-600"
        >
          + Añadir deudor
        </Link>
      </div>

      <DeudorList nplId={npl.id} />
    </>
  );
}
