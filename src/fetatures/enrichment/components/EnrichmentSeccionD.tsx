'use client';

import { useFormContext } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';

// ── Opciones ──────────────────────────────────────────────────────────────────
const ESTADOS_LEGALES = [
  { value: 'prejudicial', label: 'Prejudicial' },
  { value: 'judicial',    label: 'Judicial' },
  { value: 'finalizado',  label: 'Finalizado' },
] as const;

const FASES_JUDICIALES = [
  { value: 'monitorio',  label: 'Monitorio' },
  { value: 'ordinario',  label: 'Ordinario' },
  { value: 'ejecucion',  label: 'Ejecución hipotecaria' },
] as const;

const TIPOS_ADJUDICACION = [
  { value: 'acreedor', label: 'Al acreedor' },
  { value: 'tercero',  label: 'A tercero' },
  { value: 'desierta', label: 'Subasta desierta' },
] as const;

const TIPOS_GARANTIA = [
  { value: 'hipoteca_1',   label: 'Hipoteca 1ª' },
  { value: 'hipoteca_2',   label: 'Hipoteca 2ª' },
  { value: 'hipoteca_3+',  label: 'Hipoteca 3ª o posterior' },
  { value: 'personal',     label: 'Garantía personal' },
  { value: 'pignoraticia', label: 'Prenda / Pignoraticia' },
] as const;

// ── Helper euro display ───────────────────────────────────────────────────────
const fmt = (v: string | null | undefined) => {
  const n = v ? parseFloat(String(v)) : null;
  if (n === null || isNaN(n)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
};

// ── Subcomponente select con clases consistentes ──────────────────────────────
function SelectField({
  id, label, children, reg,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  reg: ReturnType<ReturnType<typeof useFormContext<EnrichmentFormValues>>['register']>;
}) {
  return (
    <div>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <select
        id={id}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        {...reg}
      >
        {children}
      </select>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function EnrichmentSeccionD() {
  const { register, watch } = useFormContext<EnrichmentFormValues>();

  const estadoLegal      = watch('estadoLegal');
  const faseJudicial     = watch('faseJudicial');
  const totalCargas      = watch('totalCargas');
  const cargasPreferentes = watch('cargasPreferentes');
  const cargasPosteriores = watch('cargasPosteriores');
  const ibiPendiente     = watch('ibiPendiente');
  const comunidadPend    = watch('comunidadPendiente');
  const suministros      = watch('suministrosPendientes');

  // Total cargas calculado
  const totalCargasCalc = (() => {
    const p = cargasPreferentes ? parseFloat(String(cargasPreferentes)) : 0;
    const s = cargasPosteriores ? parseFloat(String(cargasPosteriores)) : 0;
    const i = ibiPendiente      ? parseFloat(String(ibiPendiente))      : 0;
    const c = comunidadPend     ? parseFloat(String(comunidadPend))     : 0;
    const u = suministros       ? parseFloat(String(suministros))       : 0;
    const sum = p + s + i + c + u;
    return sum > 0 ? sum : null;
  })();

  const totalCargasN = totalCargas ? parseFloat(String(totalCargas)) : null;

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        D. Procedimiento judicial
      </h3>

      {/* ── D1. Situación procesal ────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Situación procesal
        </h4>

        {/* Panel resumen estado */}
        {(estadoLegal || faseJudicial) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {estadoLegal && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                estadoLegal === 'finalizado' ? 'bg-green-100 text-green-700' :
                estadoLegal === 'judicial'   ? 'bg-red-100 text-red-700' :
                                               'bg-amber-100 text-amber-700'
              }`}>
                {ESTADOS_LEGALES.find(e => e.value === estadoLegal)?.label ?? estadoLegal}
              </span>
            )}
            {faseJudicial && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {FASES_JUDICIALES.find(f => f.value === faseJudicial)?.label ?? faseJudicial}
              </span>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField id="estadoLegal" label="Estado legal" reg={register('estadoLegal')}>
            <option value="">— Selecciona —</option>
            {ESTADOS_LEGALES.map(e => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </SelectField>

          <SelectField id="faseJudicial" label="Fase judicial" reg={register('faseJudicial')}>
            <option value="">— Selecciona —</option>
            {FASES_JUDICIALES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </SelectField>

          <div>
            <FormLabel htmlFor="subfaseJudicial">Subfase / detalle</FormLabel>
            <FormInput
              id="subfaseJudicial"
              placeholder="Ej. Señalamiento subasta, Notificación deudor..."
              {...register('subfaseJudicial')}
            />
          </div>

          <div>
            <FormLabel htmlFor="numeroProcedimiento">Nº procedimiento</FormLabel>
            <FormInput
              id="numeroProcedimiento"
              placeholder="30015 41 1 2016 0000834"
              className="font-mono"
              {...register('numeroProcedimiento')}
            />
          </div>

          <div className="sm:col-span-2">
            <FormLabel htmlFor="juzgado">Juzgado</FormLabel>
            <FormInput
              id="juzgado"
              placeholder="Juzgado de 1ª Instancia nº 3 de Sevilla"
              {...register('juzgado')}
            />
          </div>

          <div>
            <FormLabel htmlFor="partidoJudicial">Partido judicial</FormLabel>
            <FormInput
              id="partidoJudicial"
              placeholder="Sevilla"
              {...register('partidoJudicial')}
            />
          </div>
        </div>
      </div>

      {/* ── D2. Subasta ───────────────────────────────────────────────── */}
      {(faseJudicial === 'ejecucion' || watch('fechaSubasta') || watch('numeroSubasta')) && (
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Subasta
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <FormLabel htmlFor="fechaSubasta">Fecha de subasta</FormLabel>
              <FormInput id="fechaSubasta" type="date" {...register('fechaSubasta')} />
            </div>
            <div>
              <FormLabel htmlFor="numeroSubasta">Nº subasta</FormLabel>
              <FormInput
                id="numeroSubasta"
                className="font-mono"
                placeholder="SUB-2024-00123"
                {...register('numeroSubasta')}
              />
            </div>
            <div>
              <FormLabel htmlFor="fechaAdjudicacion">Fecha adjudicación</FormLabel>
              <FormInput id="fechaAdjudicacion" type="date" {...register('fechaAdjudicacion')} />
            </div>
            <SelectField
              id="tipoAdjudicacion"
              label="Tipo adjudicación"
              reg={register('tipoAdjudicacion')}
            >
              <option value="">— Selecciona —</option>
              {TIPOS_ADJUDICACION.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </SelectField>
          </div>
        </div>
      )}

      {/* ── D3. Cargas y gravámenes ───────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Cargas y gravámenes
        </h4>

        {/* Panel resumen cargas */}
        {totalCargasCalc !== null && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-6 text-sm">
              <div>
                <span className="text-xs uppercase tracking-wide text-red-500">Total cargas</span>
                <p className="font-bold text-red-800">
                  {totalCargasN !== null
                    ? fmt(String(totalCargasN))
                    : fmt(String(totalCargasCalc)) + ' *'}
                </p>
              </div>
              {cargasPreferentes && parseFloat(String(cargasPreferentes)) > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-red-400">Preferentes</span>
                  <p className="font-semibold text-red-700">{fmt(String(cargasPreferentes))}</p>
                </div>
              )}
              {cargasPosteriores && parseFloat(String(cargasPosteriores)) > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-red-400">Posteriores</span>
                  <p className="font-semibold text-red-700">{fmt(String(cargasPosteriores))}</p>
                </div>
              )}
            </div>
            {totalCargasN === null && (
              <p className="mt-1 text-[10px] text-red-400">* Calculado sumando los campos inferiores</p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 'totalCargas',           label: 'Total cargas (€)' },
            { id: 'cargasPreferentes',     label: 'Cargas preferentes (€)' },
            { id: 'cargasPosteriores',     label: 'Cargas posteriores (€)' },
            { id: 'ibiPendiente',          label: 'IBI pendiente (€)' },
            { id: 'comunidadPendiente',    label: 'Comunidad pendiente (€)' },
            { id: 'suministrosPendientes', label: 'Suministros pendientes (€)' },
          ].map(({ id, label }) => (
            <div key={id}>
              <FormLabel htmlFor={id}>{label}</FormLabel>
              <div className="relative">
                <FormInput
                  id={id}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register(id as keyof EnrichmentFormValues)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="embargos">Embargos</FormLabel>
            <textarea
              id="embargos"
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Descripción de embargos existentes..."
              {...register('embargos')}
            />
          </div>
          <div>
            <FormLabel htmlFor="servidumbres">Servidumbres</FormLabel>
            <textarea
              id="servidumbres"
              rows={3}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Servidumbres de paso, luces, etc."
              {...register('servidumbres')}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              {...register('usufructo')}
            />
            Existe usufructo
          </label>
        </div>
      </div>

      {/* ── D4. Garantías ─────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Garantías
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField id="tipoGarantia" label="Tipo de garantía" reg={register('tipoGarantia')}>
            <option value="">— Selecciona —</option>
            {TIPOS_GARANTIA.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </SelectField>

          <div>
            <FormLabel htmlFor="rangoGarantia">Rango</FormLabel>
            <FormInput
              id="rangoGarantia"
              placeholder="1º, 2º, 3º..."
              {...register('rangoGarantia')}
            />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                {...register('garantiaCruzada')}
              />
              Garantía cruzada
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
