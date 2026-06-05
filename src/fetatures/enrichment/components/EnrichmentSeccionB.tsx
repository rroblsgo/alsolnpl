'use client';

import { useFormContext } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import NplRichTextEditor from '@/src/fetatures/gestion_npl/components/NplRichTextEditor';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toN = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? null : n;
};

const fmt = (v: number | null) =>
  v === null
    ? '—'
    : new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(v);

// ── Subcomponente: campo numérico euro ────────────────────────────────────────
function EuroField({
  id,
  label,
  sublabel,
  reg,
  error,
  readOnly,
}: {
  id: string;
  label: string;
  sublabel?: string;
  reg?: ReturnType<ReturnType<typeof useFormContext<EnrichmentFormValues>>['register']>;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <FormLabel htmlFor={id}>
        {label}
        {sublabel && (
          <span className="ml-1 font-normal text-gray-400 text-xs">{sublabel}</span>
        )}
      </FormLabel>
      <div className="relative">
        {readOnly ? (
          <div
            id={id}
            className="flex h-9 w-full items-center rounded-md border border-gray-200
                       bg-gray-50 px-3 text-sm font-semibold text-emerald-700"
          >
            {/* valor inyectado como children por DisplayField */}
          </div>
        ) : (
          <FormInput id={id} type="number" step="0.01" min="0" placeholder="0.00" {...reg} />
        )}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          €
        </span>
      </div>
      {error && <FormError>{error}</FormError>}
    </div>
  );
}

// Campo display-only (calculado)
function DisplayEuro({ label, sublabel, value }: { label: string; sublabel?: string; value: number | null }) {
  return (
    <div>
      <FormLabel>
        {label}
        {sublabel && (
          <span className="ml-1 font-normal text-gray-400 text-xs">{sublabel}</span>
        )}
      </FormLabel>
      <div className="flex h-9 items-center rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-bold text-emerald-800">
        {fmt(value)}
      </div>
      <p className="mt-0.5 text-[10px] text-gray-400">Calculado automáticamente</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EnrichmentSeccionB() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<EnrichmentFormValues>();

  // B2 — AFS
  const principalAFS = watch('principalAFS');
  const interesesAFS = watch('interesesAFS');
  const costasAFS    = watch('costasAFS');

  // Campos para generar texto préstamo
  const fechaOriginacion       = watch('fechaOriginacion');
  const fechaVencimiento       = watch('fechaVencimiento');
  const fechaClasificacionNpl  = watch('fechaClasificacionNpl');
  const fechaCompraCartera     = watch('fechaCompraCartera');
  const fechaInicioAccionLegal = watch('fechaInicioAccionLegal');
  const principalOriginal      = watch('principalOriginal');
  const fechaAFS               = watch('fechaAFS');

  // B3 — Deuda actualizada
  const intereses = watch('intereses');
  const costas    = watch('costas');

  // B4 — Valoraciones
  const tasacionOriginal        = watch('tasacionOriginal');
  const tasacionActual          = watch('tasacionActual');
  const prestamoHipotecaDetalles = watch('prestamoHipotecaDetalles');

  // Cálculos
  const pAFS = toN(principalAFS);
  const iAFS = toN(interesesAFS);
  const cAFS = toN(costasAFS);
  const deudaTotalAFS =
    pAFS !== null || iAFS !== null || cAFS !== null
      ? (pAFS ?? 0) + (iAFS ?? 0) + (cAFS ?? 0)
      : null;

  const intN = toN(intereses);
  const cotN = toN(costas);
  const deudaActualizada =
    deudaTotalAFS !== null || intN !== null || cotN !== null
      ? (deudaTotalAFS ?? 0) + (intN ?? 0) + (cotN ?? 0)
      : null;

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        B. Datos préstamo
      </h3>

      {/* ── Panel resumen ───────────────────────────────────────────────── */}
      {(deudaTotalAFS !== null || deudaActualizada !== null) && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Deuda AFS</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(deudaTotalAFS)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Deuda actualizada</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(deudaActualizada)}</p>
          </div>
          {toN(tasacionActual) !== null && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">Tasación actual</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(toN(tasacionActual))}</p>
            </div>
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

      {/* ── B2. Datos AFS ──────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Datos AFS
        </h4>
        <p className="mb-3 text-xs text-gray-400">
          Importes de la certificación de deuda al título ejecutivo
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EuroField
            id="principalOriginal"
            label="Principal original"
            reg={register('principalOriginal')}
            error={errors.principalOriginal?.message}
          />
          <EuroField
            id="principalAFS"
            label="Principal AFS"
            reg={register('principalAFS')}
            error={errors.principalAFS?.message}
          />
          <EuroField
            id="interesesAFS"
            label="Intereses AFS"
            reg={register('interesesAFS')}
            error={errors.interesesAFS?.message}
          />
          <EuroField
            id="costasAFS"
            label="Costas AFS"
            reg={register('costasAFS')}
            error={errors.costasAFS?.message}
          />
          <DisplayEuro
            label="Deuda total AFS"
            sublabel="(calculado)"
            value={deudaTotalAFS}
          />
          <div>
            <FormLabel htmlFor="fechaAFS">Fecha AFS</FormLabel>
            <FormInput id="fechaAFS" type="date" {...register('fechaAFS')} />
          </div>
        </div>
      </div>

      {/* ── B3. Deuda actualizada ──────────────────────────────────────── */}
      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Deuda actualizada
        </h4>
        <p className="mb-3 text-xs text-gray-400">
          Incrementos sobre la deuda AFS a la fecha de análisis
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EuroField
            id="intereses"
            label="Intereses"
            reg={register('intereses')}
            error={errors.intereses?.message}
          />
          <EuroField
            id="costas"
            label="Costas"
            reg={register('costas')}
            error={errors.costas?.message}
          />
          <DisplayEuro
            label="Deuda actualizada"
            sublabel="(calculado)"
            value={deudaActualizada}
          />
          <div>
            <FormLabel htmlFor="fechaCalculada">Fecha calculada</FormLabel>
            <FormInput id="fechaCalculada" type="date" {...register('fechaCalculada')} />
          </div>
        </div>
      </div>

      {/* ── B4. Valoraciones ───────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Valoraciones
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EuroField
            id="tasacionOriginal"
            label="Tasación original"
            reg={register('tasacionOriginal')}
            error={errors.tasacionOriginal?.message}
          />
          <EuroField
            id="tasacionActual"
            label="Tasación actual"
            reg={register('tasacionActual')}
            error={errors.tasacionActual?.message}
          />
          <div>
            <FormLabel htmlFor="fechaTasacion">Fecha tasación</FormLabel>
            <FormInput id="fechaTasacion" type="date" {...register('fechaTasacion')} />
          </div>
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
              <span
                className={`font-medium ${
                  (toN(tasacionActual) ?? 0) < (toN(tasacionOriginal) ?? 0)
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
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

      {/* ── B5. Préstamo hipoteca — detalles ───────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Préstamo / Hipoteca
          </h4>
          <button
            type="button"
            onClick={() => {
              const fmtDate = (v: string | null | undefined) =>
                v ? new Date(v).toLocaleDateString('es-ES') : '—';
              const fmtNum = (v: string | null | undefined) =>
                v ? `${parseFloat(v).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` : '—';

              const lines = [
                ['Fecha originación',         fmtDate(fechaOriginacion)],
                ['Fecha vencimiento',          fmtDate(fechaVencimiento)],
                ['Clasificación NPL',          fmtDate(fechaClasificacionNpl)],
                ['Compra cartera',             fmtDate(fechaCompraCartera)],
                ['Inicio acción legal',        fmtDate(fechaInicioAccionLegal)],
                ['Principal original',         fmtNum(principalOriginal)],
                ['Principal AFS',              fmtNum(principalAFS)],
                ['Intereses AFS',              fmtNum(interesesAFS)],
                ['Costas AFS',                 fmtNum(costasAFS)],
                ['Fecha AFS',                  fmtDate(fechaAFS)],
                ['Deuda AFS (total)',           (() => {
                  const p = principalAFS ? parseFloat(principalAFS) : 0;
                  const i = interesesAFS ? parseFloat(interesesAFS) : 0;
                  const c = costasAFS    ? parseFloat(costasAFS)    : 0;
                  const total = p + i + c;
                  return total > 0
                    ? `${total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
                    : '—';
                })()],
              ];

              const html =
                '<p><strong>Datos del préstamo</strong></p>' +
                lines
                  .map(([label, val]) => `<p><strong>${label}:</strong> ${val}</p>`)
                  .join('');

              setValue('prestamoHipotecaDetalles', html, { shouldDirty: true });
            }}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50
                       px-2.5 py-1 text-[11px] font-semibold text-blue-600
                       hover:bg-blue-100 transition-colors"
          >
            ↓ Generar desde datos préstamo
          </button>
        </div>
        <NplRichTextEditor
          value={prestamoHipotecaDetalles ?? ''}
          onChange={(html) =>
            setValue('prestamoHipotecaDetalles', html, { shouldDirty: true })
          }
          placeholder="Condiciones del préstamo, características de la hipoteca, observaciones relevantes..."
        />
      </div>
    </div>
  );
}
