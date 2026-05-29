import type { SelectOperacion } from '@/src/db/schema/operaciones';
import { STATUS_LABELS, STATUS_COLORS } from '@/src/db/schema/operaciones';

type Props = { operacion: SelectOperacion };

export default function EnrichmentHeaderOperacion({ operacion }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Operación origen
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-gray-900">
            {operacion.expedienteId ?? '—'} · {operacion.prestamoId ?? '—'}
            {operacion.mainKey && (
              <span className="ml-2 font-mono text-sm font-normal text-gray-500">
                · {operacion.mainKey}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {operacion.direccionCompleta
              ? `${operacion.direccionCompleta}, ${operacion.municipio ?? ''}`
              : (operacion.municipio ?? 'Sin dirección')}
            {operacion.provincia ? ` (${operacion.provincia})` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo inmueble */}
          {operacion.propertyTipo && (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
              {operacion.propertyTipo}
            </span>
          )}
          {/* Status */}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              STATUS_COLORS[operacion.statusTratamiento] ??
              'bg-gray-100 text-gray-600'
            }`}
          >
            {STATUS_LABELS[operacion.statusTratamiento] ?? operacion.statusTratamiento}
          </span>
        </div>
      </div>

      {/* Datos financieros básicos del excel */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        {operacion.deuda && (
          <span>
            Deuda:{' '}
            <strong className="text-gray-900">
              {Number(operacion.deuda).toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              })}
            </strong>
          </span>
        )}
        {operacion.valorTasacionSubasta && (
          <span>
            Tasación subasta:{' '}
            <strong className="text-gray-900">
              {Number(operacion.valorTasacionSubasta).toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              })}
            </strong>
          </span>
        )}
        {operacion.referenciaCatastral && (
          <span>
            Ref. catastral:{' '}
            <strong className="font-mono text-gray-900">
              {operacion.referenciaCatastral}
            </strong>
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-amber-700">
        Datos de solo lectura — origen: cartera del fondo
      </p>
    </div>
  );
}
