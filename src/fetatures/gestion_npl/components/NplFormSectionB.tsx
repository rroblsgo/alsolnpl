'use client';

import { useFormContext, useWatch, useFieldArray, Controller } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { NplInput } from '../schemas/nplSchema';
import { Plus, Trash2 } from 'lucide-react';
import NplEscenariosRentabilidad from './NplEscenariosRentabilidad';
import NplRichTextEditor from './NplRichTextEditor';
import { calcularRentabilidad } from '../utils/npl-calc';

const formatEuros = (v: number | null) => {
  if (v === null) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(v);
};

export default function NplFormSectionB() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NplInput>();

  // ── Gestor de gastos diversos ──────────────────────────────────────────────
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'gastosDiversos',
  });

  // ── Valores para cálculos en vivo ─────────────────────────────────────────
  const watchedFields = useWatch({
    name: [
      'costeAdquisicionCredito',
      'impuestosAjd',
      'costesNotariaRegistro',
      'comisionIntermediacion',
      'principal',      // viene de sección C
      'intereses',      // viene de sección C
      'costas',         // viene de sección C
      'gastosDacion',
      'precioMercado',
      'precioVentaRapida',
      'pujaProbable',
      'fechaCompra',
      'fechaTerminacion',
      'gastosDiversos',
    ],
  });
  const [
    coste,
    ajd,
    notaria,
    comisionInterm,
    principal,
    intereses,
    costas,
    gastosDacion,
    mercado,
    ventaRapida,
    puja,
    fechaCompra,
    fechaTerminacion,
    gastosDiversos,
  ] = watchedFields;

  const toN = (v: string | undefined) =>
    v && !isNaN(parseFloat(v)) ? parseFloat(v) : null;

  const pN = toN(principal);
  const iN = toN(intereses);
  const cN = toN(costas);
  const deudaActualizada =
    pN !== null || iN !== null || cN !== null
      ? (pN ?? 0) + (iN ?? 0) + (cN ?? 0)
      : null;

  const sumGastosDiversos =
    gastosDiversos?.reduce(
      (acc: number, g: { titulo: string; valor: number }) =>
        acc + (Number(g.valor) || 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
        B. Rentabilidad
      </h3>

      {/* ── Deuda actualizada (display-only, calculada desde Sección C) ──── */}
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-gray-700">
            Deuda actualizada
          </span>
          <span className="text-base font-bold text-gray-900">
            {formatEuros(deudaActualizada)}
          </span>
        </div>
        <p className="text-xs text-gray-400 italic">
          Calculado en Sección C (principal + intereses + costas)
        </p>
      </div>

      {/* ── Costes y valoraciones ─────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="costeAdquisicionCredito">
            Coste adquisición crédito (€)
          </FormLabel>
          <FormInput
            id="costeAdquisicionCredito"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('costeAdquisicionCredito')}
          />
          {errors.costeAdquisicionCredito && (
            <FormError>{errors.costeAdquisicionCredito.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="impuestosAjd">Impuestos AJD (€)</FormLabel>
          <FormInput
            id="impuestosAjd"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('impuestosAjd')}
          />
          {errors.impuestosAjd && (
            <FormError>{errors.impuestosAjd.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="costesNotariaRegistro">
            Costes notaría y registro (€)
          </FormLabel>
          <FormInput
            id="costesNotariaRegistro"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('costesNotariaRegistro')}
          />
          {errors.costesNotariaRegistro && (
            <FormError>{errors.costesNotariaRegistro.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="gastosDacion">Gastos dación (€)</FormLabel>
          <FormInput
            id="gastosDacion"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('gastosDacion')}
          />
          {errors.gastosDacion && (
            <FormError>{errors.gastosDacion.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="comisionIntermediacion">
            Comisión intermediación (€)
          </FormLabel>
          <FormInput
            id="comisionIntermediacion"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('comisionIntermediacion')}
          />
          {errors.comisionIntermediacion && (
            <FormError>{errors.comisionIntermediacion.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="pujaProbable">Puja probable (€)</FormLabel>
          <FormInput
            id="pujaProbable"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('pujaProbable')}
          />
          {errors.pujaProbable && (
            <FormError>{errors.pujaProbable.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="precioMercado">Precio de mercado (€)</FormLabel>
          <FormInput
            id="precioMercado"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('precioMercado')}
          />
          {errors.precioMercado && (
            <FormError>{errors.precioMercado.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="precioVentaRapida">
            Precio venta rápida (€)
          </FormLabel>
          <FormInput
            id="precioVentaRapida"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('precioVentaRapida')}
          />
          {errors.precioVentaRapida && (
            <FormError>{errors.precioVentaRapida.message}</FormError>
          )}
        </div>
      </div>

      {/* ── Fechas ────────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="fechaCompra">Fecha de compra</FormLabel>
          <FormInput
            id="fechaCompra"
            type="date"
            {...register('fechaCompra')}
          />
        </div>
        <div>
          <FormLabel htmlFor="fechaTerminacion">Fecha de terminación</FormLabel>
          <FormInput
            id="fechaTerminacion"
            type="date"
            {...register('fechaTerminacion')}
          />
        </div>
      </div>

      {/* ── Gastos diversos ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <FormLabel>Gastos diversos</FormLabel>
          <button
            type="button"
            onClick={() => append({ titulo: '', valor: 0 })}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir gasto
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Sin gastos adicionales.
          </p>
        )}

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Concepto (ej. Rehabilitación)"
                  {...register(`gastosDiversos.${index}.titulo`)}
                />
                {errors.gastosDiversos?.[index]?.titulo && (
                  <FormError>
                    {errors.gastosDiversos[index].titulo?.message}
                  </FormError>
                )}
              </div>
              <div className="w-36">
                <FormInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register(`gastosDiversos.${index}.valor`, {
                    valueAsNumber: true,
                  })}
                />
                {errors.gastosDiversos?.[index]?.valor && (
                  <FormError>
                    {errors.gastosDiversos[index].valor?.message}
                  </FormError>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1.5 text-red-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Escenarios de rentabilidad en vivo ──────────────────────────── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          📊 Escenarios de rentabilidad
        </h4>
        <NplEscenariosRentabilidad
          escenarios={
            calcularRentabilidad({
              costeAdquisicionCredito: coste,
              impuestosAjd: ajd,
              costesNotariaRegistro: notaria,
              comisionIntermediacion: comisionInterm,
              principal: principal,
              intereses: intereses,
              costas: costas,
              gastosDacion: gastosDacion,
              precioMercado: mercado,
              precioVentaRapida: ventaRapida,
              pujaProbable: puja,
              fechaCompra: fechaCompra,
              fechaTerminacion: fechaTerminacion,
              gastosDiversos: gastosDiversos ?? [],
            }).escenarios
          }
          inversionTotal={
            calcularRentabilidad({
              costeAdquisicionCredito: coste,
              impuestosAjd: ajd,
              costesNotariaRegistro: notaria,
              comisionIntermediacion: comisionInterm,
              gastosDiversos: gastosDiversos ?? [],
            }).inversionTotal
          }
        />
      </div>

      {/* ── Información para el inversor ─────────────────────────────────── */}
      <div>
        <FormLabel>Información para el inversor</FormLabel>
        <Controller
          control={control}
          name="informacionInversor"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.informacionInversor?.message}
              placeholder="Texto orientado al inversor: estrategia recomendada, ROI estimado, plazos, condiciones especiales..."
            />
          )}
        />
      </div>
    </div>
  );
}
