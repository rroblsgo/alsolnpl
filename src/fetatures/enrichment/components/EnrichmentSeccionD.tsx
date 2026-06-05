'use client';

import { useFormContext } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import NplRichTextEditor from '@/src/fetatures/gestion_npl/components/NplRichTextEditor';

// ── Opciones ──────────────────────────────────────────────────────────────────
const PROCEDIMIENTOS = [
  { value: 'EJH',       label: 'EJH — Ejecución hipotecaria' },
  { value: 'ETNJ',      label: 'ETNJ — Ejecución de título no judicial' },
  { value: 'ETJ',       label: 'ETJ — Ejecución de título judicial' },
  { value: 'PO',        label: 'PO — Procedimiento ordinario' },
  { value: 'DESAHUCIO', label: 'Desahucio' },
  { value: 'OTRO',      label: 'Otro' },
] as const;

const TIPOS_ADJUDICACION = [
  { value: 'acreedor', label: 'Acreedor' },
  { value: 'tercero',  label: 'Tercero' },
  { value: 'desierta', label: 'Desierta' },
] as const;

const SELECT_CLASS =
  'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

const TEXTAREA_CLASS =
  'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

// ── Componente principal ──────────────────────────────────────────────────────
export default function EnrichmentSeccionD() {
  const { register, watch, setValue } = useFormContext<EnrichmentFormValues>();

  const actuaciones        = watch('actuacionesJudiciales') ?? [];
  const riesgosJuridicos   = watch('riesgosJuridicos');
  const cargas             = watch('cargas');
  const embargos           = watch('embargos');
  const notasInternas      = watch('notasInternas');

  // ── Helpers actuaciones ───────────────────────────────────────────────────
  const addActuacion = () => {
    setValue(
      'actuacionesJudiciales',
      [...actuaciones, { fecha: '', titulo: '' }],
      { shouldDirty: true }
    );
  };

  const removeActuacion = (idx: number) => {
    setValue(
      'actuacionesJudiciales',
      actuaciones.filter((_, i) => i !== idx),
      { shouldDirty: true }
    );
  };

  const updateActuacion = (idx: number, field: 'fecha' | 'titulo', value: string) => {
    const updated = actuaciones.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    setValue('actuacionesJudiciales', updated, { shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        D. Procedimiento judicial
      </h3>

      {/* ── D1. Identificación del procedimiento ───────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Identificación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tipo de procedimiento */}
          <div>
            <FormLabel htmlFor="procedimiento">Tipo de procedimiento</FormLabel>
            <select id="procedimiento" className={SELECT_CLASS} {...register('procedimiento')}>
              <option value="">— Seleccionar —</option>
              {PROCEDIMIENTOS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <FormLabel htmlFor="numeroProcedimiento">Nº procedimiento</FormLabel>
            <FormInput
              id="numeroProcedimiento"
              placeholder="2024/0001"
              {...register('numeroProcedimiento')}
            />
          </div>

          <div>
            <FormLabel htmlFor="ejecutante">Ejecutante</FormLabel>
            <FormInput
              id="ejecutante"
              placeholder="Nombre del ejecutante"
              {...register('ejecutante')}
            />
          </div>

          <div className="sm:col-span-2">
            <FormLabel htmlFor="juzgado">Juzgado</FormLabel>
            <FormInput
              id="juzgado"
              placeholder="Juzgado de Primera Instancia nº..."
              {...register('juzgado')}
            />
          </div>
        </div>
      </div>

      {/* ── D2. Subasta / Adjudicación ─────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Subasta y adjudicación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FormLabel htmlFor="fechaSubasta">Fecha subasta</FormLabel>
            <FormInput id="fechaSubasta" type="date" {...register('fechaSubasta')} />
          </div>
          <div>
            <FormLabel htmlFor="numeroSubasta">Nº subasta</FormLabel>
            <FormInput id="numeroSubasta" placeholder="SUB-2024-0001" {...register('numeroSubasta')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaAdjudicacion">Fecha adjudicación</FormLabel>
            <FormInput id="fechaAdjudicacion" type="date" {...register('fechaAdjudicacion')} />
          </div>
          <div>
            <FormLabel htmlFor="tipoAdjudicacion">Tipo adjudicación</FormLabel>
            <select id="tipoAdjudicacion" className={SELECT_CLASS} {...register('tipoAdjudicacion')}>
              <option value="">— Seleccionar —</option>
              {TIPOS_ADJUDICACION.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── D3. Auto de despacho de ejecución ─────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Auto de despacho de ejecución
        </h4>
        <textarea
          id="autoDespachoEjecucion"
          rows={4}
          className={TEXTAREA_CLASS}
          placeholder="Referencia al auto, fecha, observaciones..."
          {...register('autoDespachoEjecucion')}
        />
      </div>

      {/* ── D4. Actuaciones judiciales ─────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Actuaciones judiciales
          </h4>
          <button
            type="button"
            onClick={addActuacion}
            className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700
                       hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            + Añadir actuación
          </button>
        </div>

        {actuaciones.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
            Sin actuaciones registradas
          </p>
        ) : (
          <div className="space-y-2">
            {actuaciones.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <input
                  type="date"
                  value={act.fecha}
                  onChange={(e) => updateActuacion(idx, 'fecha', e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none w-36"
                />
                <input
                  type="text"
                  value={act.titulo}
                  onChange={(e) => updateActuacion(idx, 'titulo', e.target.value)}
                  placeholder="Descripción de la actuación"
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeActuacion(idx)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── D5. Riesgos jurídicos — TipTap ────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Riesgos jurídicos
        </h4>
        <NplRichTextEditor
          value={riesgosJuridicos ?? ''}
          onChange={(html) => setValue('riesgosJuridicos', html, { shouldDirty: true })}
          placeholder="Riesgos jurídicos identificados, posibles oposiciones, incidencias procesales..."
        />
      </div>

      {/* ── D6. Cargas — TipTap ───────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Cargas
        </h4>
        <NplRichTextEditor
          value={cargas ?? ''}
          onChange={(html) => setValue('cargas', html, { shouldDirty: true })}
          placeholder="Cargas preferentes, posteriores, IBI pendiente, comunidad, suministros..."
        />
      </div>

      {/* ── D7. Embargos — TipTap ─────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Embargos
        </h4>
        <NplRichTextEditor
          value={embargos ?? ''}
          onChange={(html) => setValue('embargos', html, { shouldDirty: true })}
          placeholder="Embargos anotados, usufructo, servidumbres..."
        />
      </div>

      {/* ── D8. Notas internas — TipTap ───────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Notas internas
        </h4>
        <NplRichTextEditor
          value={notasInternas ?? ''}
          onChange={(html) => setValue('notasInternas', html, { shouldDirty: true })}
          placeholder="Notas de uso interno, observaciones del equipo..."
        />
      </div>
    </div>
  );
}
