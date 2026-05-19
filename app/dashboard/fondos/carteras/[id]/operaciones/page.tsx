import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { requireDashboard } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { fondoService } from '@/src/fetatures/fondos/services/FondoService';
import { operacionesRepository } from '@/src/fetatures/fondos/services/OperacionesRepository';
import OperacionesTable from '@/src/fetatures/fondos/components/OperacionesTable';
import type { MapItem } from '@/src/db/schema/fondos';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const carteraId = Number(id);
  if (isNaN(carteraId)) notFound();
  const cartera = await fondoService.getCartera(carteraId);
  return { title: generatePageTitle(`Operaciones: ${cartera.carteraName}`) };
}

export default async function OperacionesCarteraPage({ params }: Props) {
  // Cualquier usuario interno del dashboard puede ver operaciones
  await requireDashboard();

  const { id } = await params;
  const carteraId = Number(id);
  if (isNaN(carteraId)) notFound();

  const [cartera, rows] = await Promise.all([
    fondoService.getCartera(carteraId),
    operacionesRepository.findByCartera(carteraId),
  ]);

  const mapItems = (cartera.mapItems as MapItem[]) ?? [];

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{cartera.carteraName}</h1>
          <p className="text-sm text-gray-500">
            {rows.length} operaciones · {mapItems.length} columnas mapeadas
            {cartera.excelFile && (
              <span className="ml-2 font-mono text-xs text-gray-400">{cartera.excelFile}</span>
            )}
          </p>
        </div>
        <Link href={`/dashboard/fondos/${cartera.fondoId}`}
          className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600">
          ← Volver al fondo
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No hay operaciones cargadas para esta cartera</p>
        </div>
      ) : (
        <Suspense fallback={<p className="text-sm text-gray-400">Cargando tabla...</p>}>
          <OperacionesTable operaciones={rows} mapItems={mapItems} carteraName={cartera.carteraName} />
        </Suspense>
      )}
    </div>
  );
}
