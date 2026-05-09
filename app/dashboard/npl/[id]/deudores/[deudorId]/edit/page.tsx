import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import { NplPolicy } from '@/src/fetatures/gestion_npl/policies/NplPolicy';
import { deudorService } from '@/src/fetatures/npl_deudores/services/DeudorService';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import Heading from '@/src/shared/components/typography/Heading';
import EditDeudor from '@/src/fetatures/npl_deudores/components/EditDeudor';

type Props = { params: Promise<{ id: string; deudorId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deudorId } = await params;
  const deudor = await deudorService.getDeudor(Number(deudorId));
  return { title: generatePageTitle(`Editar deudor — ${deudor.nombre}`) };
}

export default async function EditDeudorPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id, deudorId } = await params;
  const npl = await nplService.getNpl(Number(id));

  if (!NplPolicy.canEdit(session.user, npl)) redirect('/dashboard/npl');

  const deudor = await deudorService.getDeudor(Number(deudorId));

  return (
    <>
      <Heading className="text-center text-amber-500">Editar deudor</Heading>
      <p className="mt-1 text-center text-sm text-gray-500">
        NPL: <span className="font-semibold">{npl.tituloOperacion}</span>
      </p>

      <Link
        href={`/dashboard/npl/${npl.id}/deudores`}
        className="mt-5 inline-block rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        ← Volver a deudores
      </Link>

      <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
        <EditDeudor deudor={deudor} nplId={npl.id} />
      </div>
    </>
  );
}
