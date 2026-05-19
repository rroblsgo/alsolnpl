import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { fondoService } from '@/src/fetatures/fondos/services/FondoService';
import MapeoCartera from '@/src/fetatures/fondos/components/MapeoCartera';
import type { MapItem } from '@/src/db/schema/fondos';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const carteraId = Number(id);
  if (isNaN(carteraId)) notFound();
  const cartera = await fondoService.getCartera(carteraId);
  return { title: generatePageTitle(`Mapeo: ${cartera.carteraName}`) };
}

export default async function MapeoCarteraPage({ params }: Props) {
  await requireRole([ROLES.ADMIN]);

  const { id } = await params;
  const carteraId = Number(id);
  if (isNaN(carteraId)) notFound();

  const cartera = await fondoService.getCartera(carteraId);
  const existingItems = (cartera.mapItems as MapItem[]) ?? [];
  const initialColumnas = existingItems.map((m) => m.columna_name_origen);

  return (
    <>
      <Heading className="text-center text-amber-500">Mapeo de columnas</Heading>
      <div className="mt-2 flex gap-3">
        <Link href={`/dashboard/fondos/${cartera.fondoId}`}
          className="inline-block rounded-lg bg-orange-500 px-8 py-2 text-xs font-bold text-white hover:bg-orange-600">
          ← Volver al fondo
        </Link>
      </div>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
        <MapeoCartera cartera={cartera} initialColumnas={initialColumnas} />
      </div>
    </>
  );
}
