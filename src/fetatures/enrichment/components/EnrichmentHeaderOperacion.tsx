import type { SelectOperacion } from '@/src/db/schema/operaciones';
import { STATUS_LABELS, STATUS_COLORS } from '@/src/db/schema/operaciones';

type StatusPromocion = 'en_curso' | 'desestimado' | 'promocionado';

const PROMOCION_CONFIG: Record<StatusPromocion, { label: string; cls: string }> = {
  en_curso:     { label: '⏳ En curso',     cls: 'bg-blue-100 text-blue-800 ring-blue-200' },
  desestimado:  { label: '✗ Desestimado',  cls: 'bg-red-100 text-red-700 ring-red-200' },
  promocionado: { label: '✓ Promocionado', cls: 'bg-emerald-100 text-emerald-800 ring-emerald-200' },
};

type Props = {
  operacion:          SelectOperacion;
  tituloOperacion?:   string | null;
  statusPromocion?:   StatusPromocion | null;
};

export default function EnrichmentHeaderOperacion({ operacion, tituloOperacion, statusPromocion }: Props) {
  const promocion = statusPromocion ? PROMOCION_CONFIG[statusPromocion] : null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
            Operación origen
          </p>
          {tituloOperacion && (
            <p className="mt-0.5 text-lg font-semibold text-gray-900">
              {tituloOperacion}
            </p>
          )}
          <h2 className={`font-semibold text-gray-900 ${tituloOperacion ? 'mt-0.5 text-sm text-gray-500' : 'mt-0.5 text-base'}`}>
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
          {/* Estado promoción NPL */}
          {promocion && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${promocion.cls}`}>
              {promocion.label}
            </span>
          )}
          {/* Tipo inmueble */}
          {operacion.propertyTipo && (
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
              {operacion.propertyTipo}
            </span>
          )}
          {/* Status operación */}
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

      {/* Datos registrales básicos */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        {operacion.referenciaCatastral && (
          <span>
            Ref. catastral:{' '}
            <strong className="font-mono text-gray-900">
              {operacion.referenciaCatastral}
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
      </div>

      <p className="mt-2 text-xs text-amber-700">
        Datos de solo lectura — origen: cartera del fondo
      </p>
    </div>
  );
}
