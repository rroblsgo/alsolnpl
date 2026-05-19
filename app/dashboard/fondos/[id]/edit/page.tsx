import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import EditFondo from '@/src/fetatures/fondos/components/EditFondo';
import { fondoService } from '@/src/fetatures/fondos/services/FondoService';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fondoId = Number(id);
  if (isNaN(fondoId)) notFound();
  const fondo = await fondoService.getFondo(fondoId);
  return { title: generatePageTitle(`Editar: ${fondo.nombre}`) };
}

export default async function EditFondoPage({ params }: Props) {
  const session = await requireRole([ROLES.ADMIN]);
  const { id } = await params;
  const fondoId = Number(id);
  if (isNaN(fondoId)) notFound();
  const fondo = await fondoService.getFondoForEdit(fondoId, session.user);

  return (
    <>
      <Heading className="text-center text-amber-500">Editar fondo</Heading>
      <Link href="/dashboard/fondos"
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-xl">
        ← Volver a fondos
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <EditFondo fondo={fondo} />
      </div>
    </>
  );
}
