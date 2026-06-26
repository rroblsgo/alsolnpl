import { Metadata } from 'next';
import Link from 'next/link';
import type { Route } from 'next';
import { db } from '@/src/db';
import { operacionEnrichments, operaciones } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { requireDashboard } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import Heading from '@/src/shared/components/typography/Heading';
import type { SeccionesCompletadas } from '@/src/fetatures/enrichment/types/enrichment.types';
import { calcularCompletitudTotal } from '@/src/fetatures/enrichment/types/enrichment.types';

export const metadata: Metadata = {
  title: generatePageTitle('Enrichments'),
};

// ── Completitud badge por sección ─────────────────────────────────────────────
function SeccionBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold
      ${done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}
      title={label}
    >
      {label}
    </span>
  );
}

// ── Barra de progreso ─────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${
            pct === 100
              ? 'bg-emerald-500'
              : pct >= 50
                ? 'bg-amber-400'
                : 'bg-gray-300'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-gray-500">{pct}%</span>
    </div>
  );
}

export default async function EnrichmentsPage() {
  await requireDashboard();

  // Join enrichments con operaciones para datos de contexto
  const rows = await db
    .select({
      id: operacionEnrichments.id,
      operacionId: operacionEnrichments.operacionId,
      nplId: operacionEnrichments.nplId,
      updatedAt: operacionEnrichments.updatedAt,
      secciones: operacionEnrichments.seccionesCompletadas,
      tituloOperacion: operacionEnrichments.tituloOperacion,
      statusPromocion: operacionEnrichments.statusPromocionNpl,
      // Operación origen
      mainKey: operaciones.mainKey,
      expedienteId: operaciones.expedienteId,
      municipio: operaciones.municipio,
      provincia: operaciones.provincia,
      propertyTipo: operaciones.propertyTipo,
      // Datos del enrichment para completitud
      referenciaCatastral: operacionEnrichments.referenciaCatastral,
      provinciaEnr: operacionEnrichments.provincia,
      municipioEnr: operacionEnrichments.municipio,
      tipoInmueble: operacionEnrichments.tipoInmueble,
    })
    .from(operacionEnrichments)
    .innerJoin(
      operaciones,
      eq(operacionEnrichments.operacionId, operaciones.id)
    )
    .orderBy(operacionEnrichments.updatedAt);

  const SECCIONES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
  const SECCION_LABELS: Record<string, string> = {
    A: 'Identificadores',
    B: 'Préstamo',
    C: 'Inmueble',
    D: 'Judicial',
    E: 'Deudores',
    F: 'Estrategia',
  };

  return (
    <>
      <Heading className="text-center text-emerald-700">Enrichments</Heading>
      <div className="mb-6 text-center">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
          {rows.length} registro{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">
            No hay enrichments aún. Selecciona una operación y pulsa Iniciar
            Enrichment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Operación</th>
                <th className="px-4 py-3 text-left">Ubicación</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Secciones</th>
                <th className="px-4 py-3 text-left">Completitud</th>
                <th className="px-4 py-3 text-left">Actualizado</th>
                <th className="px-4 py-3 text-left">NPL</th>
                <th className="sticky right-0 bg-gray-50 px-4 py-3 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const secciones = row.secciones as SeccionesCompletadas;
                const pct = calcularCompletitudTotal({
                  sellerReference: undefined, // usa secciones_completadas
                  seccionesCompletadas: secciones,
                } as any);
                // Calcular % real desde flags
                const done = Object.values(secciones).filter(Boolean).length;
                const pctReal = Math.round((done / 6) * 100);

                return (
                  <tr key={row.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {row.tituloOperacion && (
                        <p className="font-semibold text-gray-900 leading-tight">
                          {row.tituloOperacion}
                        </p>
                      )}
                      <p
                        className={`font-mono text-xs text-gray-500 ${row.tituloOperacion ? '' : 'font-medium text-gray-900 text-sm'}`}
                      >
                        {row.expedienteId ?? `Operación ${row.operacionId}`}
                      </p>
                      {row.mainKey && (
                        <p className="font-mono text-[10px] text-gray-400">
                          {row.mainKey}
                        </p>
                      )}
                      {/* Badge estado — siempre visible en la columna de operación */}
                      <span
                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                          row.statusPromocion === 'promocionado'
                            ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                            : row.statusPromocion === 'desestimado'
                              ? 'bg-red-100 text-red-700 ring-red-200'
                              : 'bg-blue-100 text-blue-700 ring-blue-200'
                        }`}
                      >
                        {row.statusPromocion === 'promocionado'
                          ? '✓ Promocionado'
                          : row.statusPromocion === 'desestimado'
                            ? '✗ Desestimado'
                            : '⏳ En curso'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.municipioEnr ?? row.municipio ?? '—'}
                      {(row.provinciaEnr ?? row.provincia) && (
                        <span className="text-gray-400">
                          {' '}
                          ({row.provinciaEnr ?? row.provincia})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(row.tipoInmueble ?? row.propertyTipo) ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {row.tipoInmueble ?? row.propertyTipo}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {SECCIONES.map((s) => (
                          <SeccionBadge
                            key={s}
                            done={
                              secciones[
                                s.toLowerCase() as keyof SeccionesCompletadas
                              ]
                            }
                            label={s}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar pct={pctReal} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(row.updatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {/* Badge estado promoción */}
                      {row.statusPromocion && (
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                            row.statusPromocion === 'promocionado'
                              ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                              : row.statusPromocion === 'desestimado'
                                ? 'bg-red-100 text-red-700 ring-red-200'
                                : 'bg-blue-100 text-blue-700 ring-blue-200'
                          }`}
                        >
                          {row.statusPromocion === 'promocionado'
                            ? '✓ Promocionado'
                            : row.statusPromocion === 'desestimado'
                              ? '✗ Desestimado'
                              : '⏳ En curso'}
                        </span>
                      )}
                      {/* Link al NPL si existe */}
                      {row.nplId && (
                        <Link
                          href={`/dashboard/npl/${row.nplId}` as Route}
                          className="block text-xs text-emerald-600 hover:underline font-medium"
                        >
                          NPL #{row.nplId} →
                        </Link>
                      )}
                    </td>
                    <td className="sticky right-0 bg-white px-4 py-3 text-right shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      <Link
                        href={
                          `/dashboard/operaciones/${row.operacionId}/enrichment` as Route
                        }
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5
                                   text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 whitespace-nowrap"
                      >
                        Editar →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
