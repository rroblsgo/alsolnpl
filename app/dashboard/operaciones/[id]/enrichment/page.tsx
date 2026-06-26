import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireDashboard } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { db } from '@/src/db';
import { users as usersTable } from '@/src/db/schema/auth-schema';
import { operacionesRepository } from '@/src/fetatures/fondos/services/OperacionesRepository';
import { enrichmentService } from '@/src/fetatures/enrichment/services/EnrichmentService';
import { enrichmentDeudoresRepository } from '@/src/fetatures/enrichment/services/EnrichmentDeudoresRepository';
import Heading from '@/src/shared/components/typography/Heading';
import EnrichmentHeaderOperacion from '@/src/fetatures/enrichment/components/EnrichmentHeaderOperacion';
import EnrichmentForm from '@/src/fetatures/enrichment/components/EnrichmentForm';
import InitEnrichmentButton from '@/src/fetatures/enrichment/components/InitEnrichmentButton';

export const metadata: Metadata = {
  title: generatePageTitle('Enrichment'),
};

type Props = { params: Promise<{ id: string }> };

export default async function EnrichmentPage({ params }: Props) {
  const session = await requireDashboard();
  const { id } = await params;
  const operacionId = parseInt(id, 10);
  if (isNaN(operacionId)) notFound();

  const operacion = await operacionesRepository.findById(operacionId);
  if (!operacion) notFound();

  const estadosPermitidos: string[] = [
    'seleccionado',
    'comercializado',
    'ofertado',
    'reservado',
    'vendido',
    'cancelado',
  ];
  const puedeEnriquecer = estadosPermitidos.includes(
    operacion.statusTratamiento
  );
  const enrichment = await enrichmentService
    .findByOperacionId(operacionId)
    .catch((e) => {
      console.error('[EnrichmentPage] Error cargando enrichment:', e);
      return null;
    });

  // Cargar deudores si ya existe el enrichment
  const deudores = enrichment
    ? await enrichmentDeudoresRepository.findByEnrichmentId(enrichment.id)
    : [];

  // Usuarios para selector de asignado en tareas
  const usersList = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable)
    .orderBy(usersTable.name);

  // Expediente para pre-rellenar tareas
  const expediente =
    operacion.mainKey ?? operacion.expedienteId ?? `OP-${operacionId}`;

  return (
    <>
      <Heading className="text-emerald-700 text-center">Enrichment</Heading>
      <div className="mb-6 flex items-start justify-between gap-4">
        {puedeEnriquecer && !enrichment && (
          <InitEnrichmentButton operacionId={operacionId} enrichmentId={null} />
        )}
      </div>

      <EnrichmentHeaderOperacion
        operacion={operacion}
        tituloOperacion={enrichment?.tituloOperacion}
        statusPromocion={enrichment?.statusPromocionNpl as any}
      />

      <div className="mt-6">
        {!puedeEnriquecer ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <p className="text-sm font-medium text-gray-500">
              Esta operación debe estar en estado{' '}
              <strong className="text-emerald-700">Seleccionado</strong> para
              iniciar el proceso de enrichment.
            </p>
          </div>
        ) : !enrichment ? (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 py-12 text-center">
            <p className="text-sm font-medium text-emerald-700">
              Pulsa <strong>Iniciar Enrichment</strong> para comenzar a
              recopilar información sobre esta operación.
            </p>
          </div>
        ) : (
          <EnrichmentForm
            enrichment={enrichment}
            operacionId={operacionId}
            expediente={expediente}
            initialDeudores={deudores}
            users={usersList}
            currentUserId={session.user.id}
            notasTratamiento={operacion.notasTratamiento}
          />
        )}
      </div>
    </>
  );
}
