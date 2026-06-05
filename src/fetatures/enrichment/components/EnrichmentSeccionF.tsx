'use client';

import { useFormContext, useWatch, useFieldArray } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import { Plus, Trash2, Rocket } from 'lucide-react';
import NplEscenariosRentabilidad from '@/src/fetatures/gestion_npl/components/NplEscenariosRentabilidad';
import { calcularRentabilidad } from '@/src/fetatures/gestion_npl/utils/npl-calc';
import NplRichTextEditor from '@/src/fetatures/gestion_npl/components/NplRichTextEditor';
import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { promoverEnrichmentANplAction, desestimarEnrichmentAction } from '../actions/enrichment-actions';

// ── Opciones ──────────────────────────────────────────────────────────────────
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

const SELECT_CLASS =
  'block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ' +
  'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

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
      <select id={id} className={SELECT_CLASS} {...reg}>
        {children}
      </select>
    </div>
  );
}

const fmtEur = (v: string | number | null | undefined) => {
  const n = v ? parseFloat(String(v)) : null;
  if (n === null || isNaN(n)) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
type UserOption = { id: string; name: string; email: string };

type Props = {
  users:                UserOption[];
  currentUserId:        string;
  enrichmentId:         number;
  seccionesCompletadas: Record<string, boolean>;
  notasTratamiento?:    string | null;
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function EnrichmentSeccionF({ users, currentUserId, enrichmentId, seccionesCompletadas, notasTratamiento }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, control, watch, setValue } = useFormContext<EnrichmentFormValues>();

  // Gastos diversos — useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'gastosDiversos',
  });

  // Valores en vivo para cálculos de rentabilidad
  // deudaTotalAFS    = principalAFS + interesesAFS + costasAFS
  // deudaActualizada = deudaTotalAFS + intereses + costas
  const watchedRentabilidad = useWatch({
    name: [
      'costeAdquisicionCredito',
      'impuestosAjd',
      'costesNotariaRegistro',
      'comisionIntermediacion',
      'principalAFS',
      'interesesAFS',
      'costasAFS',
      'intereses',
      'costas',
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
    coste, ajd, notaria, comisionInterm,
    principalAFS, interesesAFS, costasAFS,
    intereses, costas,
    gastosDacion, mercado, ventaRapida, puja,
    fechaCompra, fechaTerminacion, gastosDiversos,
  ] = watchedRentabilidad;

  const toN = (v: unknown) => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v));
    return isNaN(n) ? null : n;
  };

  // deudaTotalAFS
  const pAFS = toN(principalAFS);
  const iAFS = toN(interesesAFS);
  const cAFS = toN(costasAFS);
  const deudaTotalAFS =
    pAFS !== null || iAFS !== null || cAFS !== null
      ? (pAFS ?? 0) + (iAFS ?? 0) + (cAFS ?? 0)
      : null;

  // deudaActualizada = deudaTotalAFS + intereses + costas
  const iN = toN(intereses);
  const cN = toN(costas);
  const deudaActualizada =
    deudaTotalAFS !== null || iN !== null || cN !== null
      ? (deudaTotalAFS ?? 0) + (iN ?? 0) + (cN ?? 0)
      : null;

  // Calcular escenarios en vivo
  // npl-calc: deuda = principal + intereses + costas
  // Aquí: principal ≡ deudaTotalAFS, intereses y costas son los incrementos
  const rentabilidad = calcularRentabilidad({
    costeAdquisicionCredito: coste,
    impuestosAjd:            ajd,
    costesNotariaRegistro:   notaria,
    comisionIntermediacion:  comisionInterm,
    principal:               deudaTotalAFS !== null ? String(deudaTotalAFS) : undefined,
    intereses,
    costas,
    gastosDacion,
    precioMercado:           mercado,
    precioVentaRapida:       ventaRapida,
    pujaProbable:            puja,
    fechaCompra,
    fechaTerminacion,
    gastosDiversos:          (gastosDiversos as { titulo: string; valor: number }[]) ?? [],
  });

  // Estrategia (panel resumen)
  const estrategia           = watch('estrategiaRecuperacion');
  const prioridad            = watch('prioridad');
  const riesgo               = watch('riesgoRating');
  const recuperacionEsperada = watch('recuperacionEsperada');
  const plazoRecuperacion    = watch('plazoRecuperacion');
  const notasObservaciones   = watch('notasObservaciones');
  const statusPromocionNpl   = watch('statusPromocionNpl');
  const resumenCompleto      = estrategia && prioridad && riesgo;

  const todasCompletas = Object.values(seccionesCompletadas).every(Boolean);
  const puedePromocionar = todasCompletas && statusPromocionNpl === 'promocionado';

  function handlePromocionar() {
    startTransition(async () => {
      const result = await promoverEnrichmentANplAction(enrichmentId);
      if (result.error) { toast.error(result.error); return; }
      toast.success(result.success);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        F. Estrategia y rentabilidad
      </h3>

      {/* ── F1. Rentabilidad ────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Rentabilidad
        </h4>

        {/* Deuda — display desde sección B */}
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-md border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Deuda total AFS</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {deudaTotalAFS !== null
                ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deudaTotalAFS)
                : '—'}
            </p>
            <p className="mt-0.5 text-[10px] italic text-gray-400">principal + intereses + costas AFS</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Deuda actualizada</p>
            <p className="mt-0.5 text-sm font-bold text-emerald-800">
              {deudaActualizada !== null
                ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(deudaActualizada)
                : '—'}
            </p>
            <p className="mt-0.5 text-[10px] italic text-gray-400">deuda AFS + intereses + costas</p>
          </div>
        </div>

        {/* Costes y valoraciones */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ['costeAdquisicionCredito', 'Coste adquisición crédito (€)'],
            ['impuestosAjd',            'Impuestos AJD (€)'],
            ['costesNotariaRegistro',   'Costes notaría y registro (€)'],
            ['gastosDacion',            'Gastos dación (€)'],
            ['comisionIntermediacion',  'Comisión intermediación (€)'],
            ['pujaProbable',            'Puja probable (€)'],
            ['precioMercado',           'Precio de mercado (€)'],
            ['precioVentaRapida',       'Precio venta rápida (€)'],
          ] as [keyof EnrichmentFormValues, string][]).map(([field, label]) => (
            <div key={field}>
              <FormLabel htmlFor={field}>{label}</FormLabel>
              <div className="relative">
                <FormInput
                  id={field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register(field)}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  €
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Fechas */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="fechaCompra">Fecha de compra</FormLabel>
            <FormInput id="fechaCompra" type="date" {...register('fechaCompra')} />
          </div>
          <div>
            <FormLabel htmlFor="fechaTerminacion">Fecha de terminación</FormLabel>
            <FormInput id="fechaTerminacion" type="date" {...register('fechaTerminacion')} />
          </div>
        </div>

        {/* Gastos diversos */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <FormLabel>Gastos diversos</FormLabel>
            <button
              type="button"
              onClick={() => append({ titulo: '', valor: 0 })}
              className="flex items-center gap-1 text-xs font-medium text-emerald-700
                         hover:text-emerald-900 border border-emerald-200 bg-emerald-50
                         rounded-md px-3 py-1 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir gasto
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm italic text-gray-400">Sin gastos adicionales.</p>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <FormInput
                      type="text"
                      placeholder="Concepto (ej. Rehabilitación)"
                      {...register(`gastosDiversos.${index}.titulo`)}
                    />
                  </div>
                  <div className="w-36">
                    <FormInput
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register(`gastosDiversos.${index}.valor`, { valueAsNumber: true })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escenarios de rentabilidad en vivo */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            📊 Escenarios de rentabilidad
          </h4>
          <NplEscenariosRentabilidad
            escenarios={rentabilidad.escenarios}
            inversionTotal={rentabilidad.inversionTotal}
          />
        </div>
      </div>

      {/* ── F2. Estado de promoción NPL ─────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Estado de promoción
        </h4>
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-64">
            <FormLabel htmlFor="statusPromocionNpl">Estado promoción NPL</FormLabel>
            <select
              id="statusPromocionNpl"
              className={SELECT_CLASS}
              {...register('statusPromocionNpl')}
            >
              <option value="en_curso">⏳ En curso</option>
              <option value="desestimado">✗ Desestimado</option>
              <option value="promocionado">✓ Promocionado</option>
            </select>
          </div>

          {/* Botón Promocionar NPL — solo visible cuando todo está listo */}
          {puedePromocionar && (
            <button
              type="button"
              onClick={handlePromocionar}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2
                         text-sm font-semibold text-white shadow hover:bg-emerald-700
                         disabled:opacity-60 transition-colors"
            >
              <Rocket size={15} />
              {isPending ? 'Creando NPL...' : 'Promocionar a NPL'}
            </button>
          )}

          {/* Aviso si faltan secciones */}
          {statusPromocionNpl === 'promocionado' && !todasCompletas && (
            <p className="text-xs text-amber-700">
              ⚠️ Completa todas las secciones antes de promocionar
            </p>
          )}
        </div>
      </div>

      {/* ── F3. Estrategia (resumen) ────────────────────────────────────── */}
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
              <p className="mt-0.5 text-sm font-bold text-emerald-900">{fmtEur(String(recuperacionEsperada))}</p>
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

      {/* ── F4. Estrategia de recuperación ────────────────────────────── */}
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

      {/* ── F5. Clasificación y riesgo ───────────────────────────────── */}
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

      {/* ── F6. Estimaciones financieras ─────────────────────────────── */}
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

      {/* ── F7. Gestión y documentación ──────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Gestión y documentación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="gestorAsignado">Gestor asignado</FormLabel>
            <select
              id="gestorAsignado"
              className={SELECT_CLASS}
              {...register('gestorAsignado')}
            >
              <option value="">— Sin asignar —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}{u.id === currentUserId ? ' (tú)' : ''}
                </option>
              ))}
            </select>
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
            <FormInput id="antiguedadNotaSimple" type="date" {...register('antiguedadNotaSimple')} />
          </div>
        </div>
      </div>

      {/* ── F8. Notas y observaciones ─────────────────────────────────── */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Notas y observaciones
          </h4>
          {notasTratamiento && (
            <button
              type="button"
              onClick={() => {
                const current = notasObservaciones?.trim();
                const imported = '<p><strong>Notas de tratamiento (operación):</strong></p><p>' + notasTratamiento.split('\n').join('</p><p>') + '</p>';
                const combined = current && current !== '<p></p>'
                  ? current + '<hr>' + imported
                  : imported;
                setValue('notasObservaciones', combined, { shouldDirty: true });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50
                         px-2.5 py-1 text-[11px] font-semibold text-amber-700
                         hover:bg-amber-100 transition-colors"
            >
              ↓ Importar notas de tratamiento
            </button>
          )}
        </div>
        <NplRichTextEditor
          value={notasObservaciones ?? ''}
          onChange={(html) => setValue('notasObservaciones', html, { shouldDirty: true })}
          placeholder="Observaciones generales sobre la operación: contexto, condicionantes, oportunidades detectadas, próximos pasos..."
        />
      </div>
    </div>
  );
}
