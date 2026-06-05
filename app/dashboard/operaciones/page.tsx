import { Metadata } from 'next';
import { Suspense } from 'react';
import { requireDashboard } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { operacionesRepository } from '@/src/fetatures/fondos/services/OperacionesRepository';
import Heading from '@/src/shared/components/typography/Heading';
import OperacionesGlobalTable from '@/src/fetatures/fondos/components/OperacionesGlobalTable';

export const metadata: Metadata = { title: generatePageTitle('Operaciones') };

export default async function OperacionesPage() {
  await requireDashboard();

  const rows = await operacionesRepository.findAll();

  return (
    <>
      <Heading className="text-center text-amber-500">Operaciones</Heading>
      <p className="mt-1 text-center text-sm text-gray-500">
        {rows.length.toLocaleString('es-ES')} operaciones en cartera
      </p>
      <div className="mt-6 pb-12">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
            <p className="text-sm font-medium text-gray-500">No hay operaciones cargadas todavía</p>
          </div>
        ) : (
          <Suspense fallback={<p className="text-sm text-gray-400">Cargando tabla...</p>}>
            <OperacionesGlobalTable operaciones={rows} />
          </Suspense>
        )}
      </div>
    </>
  );
}
