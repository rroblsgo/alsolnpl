'use client';

import { useFormContext } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';

const ESTRATEGIAS = [
  { value: 'reo',              label: 'REO — Adjudicación y venta del inmueble' },
  { value: 'venta_directa',    label: 'Venta directa del crédito' },
  { value: 'reestructuracion', label: 'Reestructuración de deuda' },
  { value: 'dacion',           label: 'Dación en pago' },
  { value: 'otro',             label: 'Otro' },
] as const;

const PRIORIDADES = [
  { value: 'alta',  label: '🔴 Alta' },
  { value: 'media', label: '🟡 Media' },
  { value: 'baja',  label: '🟢 Baja' },
] as const;

const RIESGOS = [
  { value: 'alto',  label: '🔴 Alto' },
  { value: 'medio', label: '🟡 Medio' },
  { value: 'bajo',  label: '🟢 Bajo' },
] as const;

const ESTADOS_DOC = [
  { value: 'completa',   label: 'Completa' },
  { value: 'incompleta', label: 'Incompleta' },
  { value: 'pendiente',  label: 'Pendiente de recibir' },
] as const;

const OPORTUNIDADES = [
  { value: 'alta_rentabilidad', label: 'Alta rentabilidad esperada' },
  { value: 'precio_entry',      label: 'Buen precio de entrada' },
  { value: 'ubicacion',         label: 'Ubicación prime' },
  { value: 'rapida_ejecucion',  label: 'Rápida ejecución' },
  { value: 'sin_cargas',        label: 'Sin cargas significativas' },
] as const;

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

const fmt = (v: string | null | undefined) => {
  const n = v ? parseFloat(String(v)) : null;
  if (n === null || isNaN(n)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
};

export default function EnrichmentSeccionF() {
  const { register, watch } = useFormContext<EnrichmentFormValues>();

  const estrategia          = watch('estrategiaRecuperacion');
  const prioridad           = watch('prioridad');
  const riesgo              = watch('riesgoRating');
  const recuperacionEsperada = watch('recuperacionEsperada');
  const plazoRecuperacion   = watch('plazoRecuperacion');

  const resumenCompleto = estrategia && prioridad && riesgo;

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        F. Estrategia y clasificación
      </h3>

      {/* Panel resumen cuando hay datos */}
      {resumenCompleto && (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Estrategia</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">
              {ESTRATEGIAS.find(e => e.value === estrategia)?.label.split(' — ')[0] ?? estrategia}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Prioridad</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">
              {PRIORIDADES.find(p => p.value === prioridad)?.label ?? prioridad}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-emerald-600">Riesgo</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-900">
              {RIESGOS.find(r => r.value === riesgo)?.label ?? riesgo}
            </p>
          </div>
          {recuperacionEsperada && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">Recuperación esperada</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmt(String(recuperacionEsperada))}</p>
            </div>
          )}
          {plazoRecuperacion && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">Plazo estimado</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-900">{plazoRecuperacion} meses</p>
            </div>
          )}
        </div>
      )}

      {/* ── F1. Estrategia ────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Estrategia de recuperación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <SelectField
              id="estrategiaRecuperacion"
              label="Estrategia principal"
              reg={register('estrategiaRecuperacion')}
            >
              <option value="">— Selecciona —</option>
              {ESTRATEGIAS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </SelectField>
          </div>

          <SelectField
            id="oportunidadInversion"
            label="Oportunidad de inversión"
            reg={register('oportunidadInversion')}
          >
            <option value="">— Selecciona —</option>
            {OPORTUNIDADES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </SelectField>
        </div>
      </div>

      {/* ── F2. Clasificación ─────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Clasificación y riesgo
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField id="prioridad" label="Prioridad" reg={register('prioridad')}>
            <option value="">— Selecciona —</option>
            {PRIORIDADES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </SelectField>

          <SelectField id="riesgoRating" label="Rating de riesgo" reg={register('riesgoRating')}>
            <option value="">— Selecciona —</option>
            {RIESGOS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </SelectField>

          <div>
            <FormLabel htmlFor="clusterGeografico">Cluster geográfico</FormLabel>
            <FormInput
              id="clusterGeografico"
              placeholder="Costa del Sol, Madrid centro..."
              {...register('clusterGeografico')}
            />
          </div>
        </div>
      </div>

      {/* ── F3. Estimaciones financieras ─────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Estimaciones
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="recuperacionEsperada">Recuperación esperada (€)</FormLabel>
            <div className="relative">
              <FormInput
                id="recuperacionEsperada"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('recuperacionEsperada')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
          </div>
          <div>
            <FormLabel htmlFor="plazoRecuperacion">
              Plazo estimado{' '}
              <span className="font-normal text-gray-400 text-xs">(meses)</span>
            </FormLabel>
            <FormInput
              id="plazoRecuperacion"
              type="number"
              step="1"
              min="0"
              placeholder="12"
              {...register('plazoRecuperacion')}
            />
          </div>
        </div>
      </div>

      {/* ── F4. Gestión y documentación ──────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Gestión y documentación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="gestorAsignado">Gestor asignado</FormLabel>
            <FormInput
              id="gestorAsignado"
              placeholder="Nombre del gestor responsable"
              {...register('gestorAsignado')}
            />
          </div>

          <SelectField
            id="estadoDocumentacion"
            label="Estado documentación"
            reg={register('estadoDocumentacion')}
          >
            <option value="">— Selecciona —</option>
            {ESTADOS_DOC.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </SelectField>

          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                {...register('escrituraDisponible')}
              />
              Escritura disponible
            </label>
          </div>

          <div>
            <FormLabel htmlFor="antiguedadNotaSimple">
              Nota simple — fecha{' '}
              <span className="font-normal text-gray-400 text-xs">(antigüedad)</span>
            </FormLabel>
            <FormInput
              id="antiguedadNotaSimple"
              type="date"
              {...register('antiguedadNotaSimple')}
            />
          </div>
        </div>
      </div>

      {/* ── F5. Notas y observaciones ─────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Notas y observaciones
        </h4>
        <textarea
          id="notasObservaciones"
          rows={6}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Observaciones generales sobre la operación: contexto, condicionantes, oportunidades detectadas, próximos pasos..."
          {...register('notasObservaciones')}
        />
      </div>
    </div>
  );
}
