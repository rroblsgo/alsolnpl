'use client';

import { useFormContext } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';

// ── Helpers ───────────────────────────────────────────────────────────────────
// Acepta tanto string (RHF raw) como number (output del preprocessor)
const toN = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? null : n;
};

const fmt = (v: number | null) =>
  v === null
    ? '—'
    : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: string | number | null | undefined) => {
  const n = toN(v);
  return n === null ? '—' : `${(n * 100).toFixed(2)} %`;
};

// ── Subcomponente: campo numérico euro ────────────────────────────────────────
function EuroField({
  id,
  label,
  sublabel,
  reg,
  error,
}: {
  id: string;
  label: string;
  sublabel?: string;
  reg: ReturnType<ReturnType<typeof useFormContext<EnrichmentFormValues>>['register']>;
  error?: string;
}) {
  return (
    <div>
      <FormLabel htmlFor={id}>
        {label}
        {sublabel && <span className="ml-1 font-normal text-gray-400 text-xs">{sublabel}</span>}
      </FormLabel>
      <div className="relative">
        <FormInput id={id} type="number" step="0.01" min="0" placeholder="0.00" {...reg} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
      </div>
      {error && <FormError>{error}</FormError>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EnrichmentSeccionB() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<EnrichmentFormValues>();

  // Valores en vivo para cálculos
  const principalPendiente  = watch('principalPendiente');
  const interesesDevengados = watch('interesesDevengados');
  const deudaTotal          = watch('deudaTotal');
  const gbv                 = watch('gbv');
  const tasacionOriginal    = watch('tasacionOriginal');
  const tasacionActual      = watch('tasacionActual');
  const valorMercado        = watch('valorMercado');
  const ltv                 = watch('ltv');
  const tipoInteres         = watch('tipoInteres');

  // Deuda calculada (si no viene directa)
  const deudaCalc = (() => {
    const p = toN(principalPendiente);
    const i = toN(interesesDevengados);
    if (p === null && i === null) return null;
    return (p ?? 0) + (i ?? 0);
  })();

  const deudaTotalN = toN(deudaTotal) ?? deudaCalc;

  // LTV calculado
  const ltvCalc = (() => {
    const d = toN(deudaTotal) ?? deudaCalc;
    const t = toN(tasacionActual) ?? toN(valorMercado);
    if (d === null || t === null || t === 0) return null;
    return (d / t) * 100;
  })();

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        B. Datos préstamo
      </h3>

      {/* ── Panel resumen financiero ────────────────────────────────────── */}
      {deudaTotalN !== null && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Deuda total</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(deudaTotalN)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">GBV</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(toN(gbv))}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">LTV</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">
              {toN(ltv) !== null ? fmtPct(ltv) : ltvCalc !== null ? `${ltvCalc.toFixed(1)} % *` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Tipo interés</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmtPct(tipoInteres)}</p>
          </div>
          {ltvCalc !== null && !toN(ltv) && (
            <p className="col-span-full text-[10px] text-emerald-600">* LTV calculado automáticamente</p>
          )}
        </div>
      )}

      {/* ── B1. Fechas ─────────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Fechas
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="fechaOriginacion">Fecha originación</FormLabel>
            <FormInput id="fechaOriginacion" type="date" {...register('fechaOriginacion')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaImpago">Fecha primer impago</FormLabel>
            <FormInput id="fechaImpago" type="date" {...register('fechaImpago')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaUltimoPago">Fecha último pago</FormLabel>
            <FormInput id="fechaUltimoPago" type="date" {...register('fechaUltimoPago')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaClasificacionNpl">Clasificación NPL</FormLabel>
            <FormInput id="fechaClasificacionNpl" type="date" {...register('fechaClasificacionNpl')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaVencimiento">Vencimiento préstamo</FormLabel>
            <FormInput id="fechaVencimiento" type="date" {...register('fechaVencimiento')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaCompraCartera">Compra de cartera</FormLabel>
            <FormInput id="fechaCompraCartera" type="date" {...register('fechaCompraCartera')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaInicioAccionLegal">Inicio acción legal</FormLabel>
            <FormInput id="fechaInicioAccionLegal" type="date" {...register('fechaInicioAccionLegal')} />
          </div>
        </div>
      </div>

      {/* ── B2. Deuda ──────────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Deuda y financiación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EuroField
            id="principalOriginal"
            label="Principal original"
            reg={register('principalOriginal')}
            error={errors.principalOriginal?.message}
          />
          <EuroField
            id="principalPendiente"
            label="Principal pendiente"
            reg={register('principalPendiente')}
            error={errors.principalPendiente?.message}
          />
          <EuroField
            id="interesesDevengados"
            label="Intereses devengados"
            reg={register('interesesDevengados')}
            error={errors.interesesDevengados?.message}
          />

          {/* Deuda total — con indicador si se puede calcular */}
          <div>
            <FormLabel htmlFor="deudaTotal">
              Deuda total
              {deudaCalc !== null && !toN(deudaTotal) && (
                <span className="ml-2 text-[10px] font-normal text-emerald-600">
                  calculada: {fmt(deudaCalc)}
                </span>
              )}
            </FormLabel>
            <div className="relative">
              <FormInput
                id="deudaTotal"
                type="number"
                step="0.01"
                min="0"
                placeholder={deudaCalc !== null ? String(deudaCalc.toFixed(2)) : '0.00'}
                {...register('deudaTotal')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
            {errors.deudaTotal && <FormError>{errors.deudaTotal.message}</FormError>}
          </div>

          <EuroField
            id="gbv"
            label="GBV"
            sublabel="Gross Book Value"
            reg={register('gbv')}
            error={errors.gbv?.message}
          />

          <div>
            <FormLabel htmlFor="tipoInteres">Tipo de interés</FormLabel>
            <div className="relative">
              <FormInput
                id="tipoInteres"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                placeholder="0.0500"
                {...register('tipoInteres')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {fmtPct(tipoInteres) !== '—' ? fmtPct(tipoInteres) : '%'}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-gray-400">Introduce el valor decimal (ej: 0.05 = 5%)</p>
            {errors.tipoInteres && <FormError>{errors.tipoInteres.message}</FormError>}
          </div>

          <EuroField
            id="cuotaMensual"
            label="Cuota mensual"
            reg={register('cuotaMensual')}
            error={errors.cuotaMensual?.message}
          />

          <div>
            <FormLabel htmlFor="ltv">
              LTV
              {ltvCalc !== null && !toN(ltv) && (
                <span className="ml-2 text-[10px] font-normal text-emerald-600">
                  calculado: {ltvCalc.toFixed(1)} %
                </span>
              )}
            </FormLabel>
            <div className="relative">
              <FormInput
                id="ltv"
                type="number"
                step="0.0001"
                min="0"
                max="10"
                placeholder={ltvCalc !== null ? (ltvCalc / 100).toFixed(4) : '0.0000'}
                {...register('ltv')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {toN(ltv) !== null ? fmtPct(ltv) : '%'}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-gray-400">Valor decimal (ej: 0.75 = 75%)</p>
          </div>

          <div>
            <FormLabel htmlFor="mesesImpago">Meses en impago</FormLabel>
            <FormInput
              id="mesesImpago"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              {...register('mesesImpago', { valueAsNumber: true })}
            />
            {errors.mesesImpago && <FormError>{errors.mesesImpago.message}</FormError>}
          </div>
        </div>
      </div>

      {/* ── B3. Valoraciones ───────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Valoraciones y precios
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EuroField
            id="tasacionOriginal"
            label="Tasación original"
            reg={register('tasacionOriginal')}
            error={errors.tasacionOriginal?.message}
          />
          <div>
            <EuroField
              id="tasacionActual"
              label="Tasación actual"
              reg={register('tasacionActual')}
              error={errors.tasacionActual?.message}
            />
          </div>
          <div>
            <FormLabel htmlFor="fechaTasacion">Fecha tasación</FormLabel>
            <FormInput id="fechaTasacion" type="date" {...register('fechaTasacion')} />
          </div>
          <EuroField
            id="valorMercado"
            label="Valor de mercado"
            reg={register('valorMercado')}
            error={errors.valorMercado?.message}
          />
          <EuroField
            id="valorEjecucionForzosa"
            label="Valor ejecución forzosa"
            sublabel="(VEF)"
            reg={register('valorEjecucionForzosa')}
            error={errors.valorEjecucionForzosa?.message}
          />
          <EuroField
            id="precioSubasta"
            label="Precio subasta"
            reg={register('precioSubasta')}
            error={errors.precioSubasta?.message}
          />
          <EuroField
            id="precioVenta"
            label="Precio venta estimado"
            reg={register('precioVenta')}
            error={errors.precioVenta?.message}
          />
        </div>

        {/* Comparativa tasaciones */}
        {(toN(tasacionOriginal) !== null || toN(tasacionActual) !== null) && (
          <div className="mt-4 flex flex-wrap gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
            {toN(tasacionOriginal) !== null && (
              <span className="text-gray-600">
                Tasación original: <strong>{fmt(toN(tasacionOriginal))}</strong>
              </span>
            )}
            {toN(tasacionActual) !== null && (
              <span className="text-gray-600">
                Tasación actual: <strong>{fmt(toN(tasacionActual))}</strong>
              </span>
            )}
            {toN(tasacionOriginal) !== null && toN(tasacionActual) !== null && (
              <span className={`font-medium ${
                (toN(tasacionActual) ?? 0) < (toN(tasacionOriginal) ?? 0)
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}>
                Variación:{' '}
                {(
                  (((toN(tasacionActual) ?? 0) - (toN(tasacionOriginal) ?? 0)) /
                    (toN(tasacionOriginal) ?? 1)) *
                  100
                ).toFixed(1)}{' '}
                %
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
