'use client';

import { useFormContext, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { NplInput } from '../schemas/nplSchema';
import {
  NPL_PROCEDIMIENTOS,
  NPL_PROCEDIMIENTO_LABELS,
} from '../types/npl.types';
import NplRichTextEditor from './NplRichTextEditor';
import { Plus, Trash2 } from 'lucide-react';

const formatEuros = (v: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);

export default function NplFormSectionC() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NplInput>();

  // ── Actuaciones judiciales (array {fecha, titulo}) ─────────────────────────
  const { fields: actuacionesFields, append: appendActuacion, remove: removeActuacion } =
    useFieldArray({ control, name: 'actuacionesJudiciales' });

  // ── Cálculo deuda actualizada en vivo ──────────────────────────────────────
  const [principal, intereses, costas] = useWatch({
    control,
    name: ['principal', 'intereses', 'costas'],
  });

  const toN = (v: string | undefined) =>
    v && !isNaN(parseFloat(v)) ? parseFloat(v) : null;

  const pN = toN(principal);
  const iN = toN(intereses);
  const cN = toN(costas);
  const deudaActualizada = (pN ?? 0) + (iN ?? 0) + (cN ?? 0);
  const limiteCostasPct = pN !== null ? pN * 0.05 : null;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
        C. Estado real y procesal
      </h3>

      {/* ── Procedimiento + Num. Procedimiento ──────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="procedimiento">Procedimiento</FormLabel>
          <select
            id="procedimiento"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('procedimiento')}
          >
            <option value="">Selecciona...</option>
            {NPL_PROCEDIMIENTOS.map((p) => (
              <option key={p} value={p}>
                {NPL_PROCEDIMIENTO_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FormLabel htmlFor="numProcedimiento">Núm. de procedimiento</FormLabel>
          <FormInput
            id="numProcedimiento"
            type="text"
            placeholder="Ej. 30015 41 1 2016 0000834"
            {...register('numProcedimiento')}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="juzgado">Juzgado</FormLabel>
          <FormInput
            id="juzgado"
            type="text"
            placeholder="Juzgado de 1ª Instancia..."
            {...register('juzgado')}
          />
        </div>
        <div>
          <FormLabel htmlFor="ejecutante">Ejecutante</FormLabel>
          <FormInput
            id="ejecutante"
            type="text"
            placeholder="Entidad ejecutante..."
            {...register('ejecutante')}
          />
        </div>
      </div>

      {/* ── Auto de despacho de ejecución ─────────────────────────────────── */}
      <div>
        <FormLabel htmlFor="autoDespachoEjecucion">
          Auto de despacho de ejecución
        </FormLabel>
        <textarea
          id="autoDespachoEjecucion"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          {...register('autoDespachoEjecucion')}
        />
      </div>

      <div>
        <FormLabel>Préstamo / hipoteca — detalles</FormLabel>
        <Controller
          control={control}
          name="prestamoHipotecaDetalles"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Entidad, escritura, capital, cesión..."
            />
          )}
        />
      </div>

      {/* ── Deuda actualizada (principal + intereses + costas) ────────────── */}
      <div className="rounded-md border border-blue-100 bg-blue-50 p-4 space-y-2">
        {/* Cabecera resumen */}
        <div className="flex flex-wrap items-baseline gap-4">
          <div>
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
              Deuda actualizada
            </span>
            <span className="ml-2 text-lg font-bold text-blue-900">
              {formatEuros(deudaActualizada)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FormLabel htmlFor="fechaCalculada" className="!mb-0 text-xs text-blue-700">
              Fecha calculada
            </FormLabel>
            <input
              id="fechaCalculada"
              type="date"
              className="rounded border border-blue-200 bg-white px-2 py-1 text-xs"
              {...register('fechaCalculada')}
            />
          </div>
        </div>

        {/* Desglose editable */}
        <div className="grid gap-3 md:grid-cols-3 pt-1">
          <div>
            <FormLabel htmlFor="principal" className="text-xs">
              Principal — Deuda total AFS (€)
            </FormLabel>
            <FormInput
              id="principal"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-white"
              {...register('principal')}
            />
            {errors.principal && (
              <FormError>{errors.principal.message}</FormError>
            )}
          </div>
          <div>
            <FormLabel htmlFor="intereses" className="text-xs">
              Intereses (€)
            </FormLabel>
            <FormInput
              id="intereses"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-white"
              {...register('intereses')}
            />
            {errors.intereses && (
              <FormError>{errors.intereses.message}</FormError>
            )}
          </div>
          <div>
            <FormLabel htmlFor="costas" className="text-xs">
              Costas (€)
              {limiteCostasPct !== null && (
                <span className="ml-1 font-normal text-gray-500">
                  — lím. 5%: {formatEuros(limiteCostasPct)}
                </span>
              )}
            </FormLabel>
            <FormInput
              id="costas"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="bg-white"
              {...register('costas')}
            />
            {errors.costas && <FormError>{errors.costas.message}</FormError>}
          </div>
        </div>
      </div>

      {/* ── Tasaciones ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <FormLabel htmlFor="tasacionSubasta">Tasación subasta (€)</FormLabel>
          <FormInput
            id="tasacionSubasta"
            type="number" step="0.01" min="0" placeholder="0.00"
            {...register('tasacionSubasta')}
          />
          {errors.tasacionSubasta && (
            <FormError>{errors.tasacionSubasta.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="tasacionActual">Tasación actual (€)</FormLabel>
          <FormInput
            id="tasacionActual"
            type="number" step="0.01" min="0" placeholder="0.00"
            {...register('tasacionActual')}
          />
          {errors.tasacionActual && (
            <FormError>{errors.tasacionActual.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="fechaTasacion">Fecha tasación</FormLabel>
          <FormInput id="fechaTasacion" type="date" {...register('fechaTasacion')} />
        </div>
      </div>

      {/* ── Notas ocupación (TipTap) ──────────────────────────────────────── */}
      <div>
        <FormLabel>Notas de ocupación</FormLabel>
        <Controller
          control={control}
          name="notasOcupacion"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Situación de ocupación, comunicaciones con el ocupante, gestiones realizadas..."
            />
          )}
        />
      </div>

      {/* ── Actuaciones seguidas (TipTap existente) ──────────────────────── */}
      <div>
        <FormLabel>Actuaciones seguidas</FormLabel>
        <Controller
          control={control}
          name="actuacionesSeguidas"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.actuacionesSeguidas?.message}
              placeholder="Hitos procesales, fechas relevantes..."
            />
          )}
        />
      </div>

      {/* ── Actuaciones judiciales (array {fecha, titulo}) ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <FormLabel>Actuaciones judiciales</FormLabel>
          <button
            type="button"
            onClick={() => appendActuacion({ fecha: '', titulo: '' })}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir actuación
          </button>
        </div>

        {actuacionesFields.length === 0 && (
          <p className="text-sm text-gray-400 italic">Sin actuaciones registradas.</p>
        )}

        <div className="space-y-2">
          {actuacionesFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="w-36 shrink-0">
                <FormInput
                  type="date"
                  {...register(`actuacionesJudiciales.${index}.fecha`)}
                />
                {errors.actuacionesJudiciales?.[index]?.fecha && (
                  <FormError>
                    {errors.actuacionesJudiciales[index].fecha?.message}
                  </FormError>
                )}
              </div>
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Descripción de la actuación"
                  {...register(`actuacionesJudiciales.${index}.titulo`)}
                />
                {errors.actuacionesJudiciales?.[index]?.titulo && (
                  <FormError>
                    {errors.actuacionesJudiciales[index].titulo?.message}
                  </FormError>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeActuacion(index)}
                className="mt-1.5 text-red-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cargas (TipTap) ────────────────────────────────────────────────── */}
      <div>
        <FormLabel>Cargas</FormLabel>
        <Controller
          control={control}
          name="cargas"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Cargas preferentes, posteriores, IBI, comunidad, suministros..."
            />
          )}
        />
      </div>

      {/* ── Embargos (TipTap) ──────────────────────────────────────────────── */}
      <div>
        <FormLabel>Embargos</FormLabel>
        <Controller
          control={control}
          name="embargos"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Embargos anotados, usufructo, servidumbres..."
            />
          )}
        />
      </div>

      {/* ── Riesgos jurídicos (TipTap) ────────────────────────────────────── */}
      <div>
        <FormLabel>Riesgos jurídicos</FormLabel>
        <Controller
          control={control}
          name="riesgosJuridicos"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.riesgosJuridicos?.message}
              placeholder="Descripción de riesgos jurídicos relevantes..."
            />
          )}
        />
      </div>

      {/* ── Notas internas (TipTap) ────────────────────────────────────────── */}
      <div>
        <FormLabel>Notas internas</FormLabel>
        <Controller
          control={control}
          name="notasInternas"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notasInternas?.message}
              placeholder="Notas de gestión interna..."
            />
          )}
        />
      </div>
    </div>
  );
}
