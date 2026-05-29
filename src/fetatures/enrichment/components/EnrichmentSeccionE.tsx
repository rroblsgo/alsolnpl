'use client';

import { useState, useTransition } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import type { SelectEnrichmentDeudor } from '@/src/db/schema';
import { saveEnrichmentDeudoresAction, type DeudorInput } from '../actions/enrichment-deudores-actions';
import { PROVINCIAS } from '@/src/fetatures/gestion_npl/data/provincias';

// ── Schema form deudores ──────────────────────────────────────────────────────
const DeudoresFormSchema = z.object({
  deudores: z.array(z.object({
    esPrincipal:       z.boolean().optional(),
    tipoRegistro:      z.enum(['DEUDOR', 'HIPOTECANTE', 'FIADOR']).optional(),
    nombre:            z.string().min(1, 'Nombre obligatorio').max(255),
    dni:               z.string().max(20).optional().nullable(),
    direccionCompleta: z.string().optional().nullable(),
    estadoOcupacional: z.string().optional().nullable(),
    vulnerabilidad:    z.string().optional().nullable(),
    notas:             z.string().optional().nullable(),
    otrosDatos:        z.array(z.object({
      titulo: z.string(),
      nombre: z.string(),
    })).optional(),
  })),
});

type DeudoresFormInput = z.infer<typeof DeudoresFormSchema>;

const TIPOS_REGISTRO = [
  { value: 'DEUDOR',       label: 'Deudor' },
  { value: 'HIPOTECANTE',  label: 'Hipotecante no deudor' },
  { value: 'FIADOR',       label: 'Fiador / Avalista' },
] as const;

const SITUACIONES_LABORALES = [
  { value: 'empleado',    label: 'Empleado cuenta ajena' },
  { value: 'autonomo',    label: 'Autónomo / Empresario' },
  { value: 'desempleado', label: 'Desempleado' },
  { value: 'jubilado',    label: 'Jubilado / Pensionista' },
  { value: 'otro',        label: 'Otro' },
] as const;

const NIVELES_INGRESOS = [
  { value: 'alto',  label: 'Alto (> 60.000 € / año)' },
  { value: 'medio', label: 'Medio (18.000 – 60.000 € / año)' },
  { value: 'bajo',  label: 'Bajo (< 18.000 € / año)' },
] as const;

// ── Panel deudor individual expandible ───────────────────────────────────────
function DeudorPanel({
  index,
  onRemove,
  methods,
}: {
  index: number;
  onRemove: () => void;
  methods: ReturnType<typeof useForm<DeudoresFormInput>>;
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const { register, watch } = methods;

  const nombre      = watch(`deudores.${index}.nombre`);
  const tipo        = watch(`deudores.${index}.tipoRegistro`);
  const esPrincipal = watch(`deudores.${index}.esPrincipal`);

  const tipoLabel = TIPOS_REGISTRO.find(t => t.value === tipo)?.label ?? tipo;

  return (
    <div className={`rounded-xl border ${esPrincipal ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}>
      {/* Cabecera colapsable */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
            ${esPrincipal ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {nombre || <span className="italic text-gray-400">Sin nombre</span>}
            </p>
            <p className="text-xs text-gray-500">
              {tipoLabel}
              {esPrincipal && <span className="ml-2 font-semibold text-emerald-600">· Principal</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
            title="Eliminar deudor"
          >
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2">
              <FormLabel htmlFor={`nombre-${index}`}>
                Nombre completo <span className="text-red-500">*</span>
              </FormLabel>
              <FormInput
                id={`nombre-${index}`}
                placeholder="Nombre y apellidos"
                {...register(`deudores.${index}.nombre`)}
              />
            </div>
            <div>
              <FormLabel htmlFor={`dni-${index}`}>DNI / NIE / CIF</FormLabel>
              <FormInput
                id={`dni-${index}`}
                placeholder="12345678A"
                className="font-mono uppercase"
                {...register(`deudores.${index}.dni`)}
              />
            </div>

            <div>
              <FormLabel htmlFor={`tipo-${index}`}>Tipo</FormLabel>
              <select
                id={`tipo-${index}`}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                {...register(`deudores.${index}.tipoRegistro`)}
              >
                {TIPOS_REGISTRO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  {...register(`deudores.${index}.esPrincipal`)}
                />
                Deudor principal
              </label>
            </div>
          </div>

          <div>
            <FormLabel htmlFor={`dir-${index}`}>Dirección completa</FormLabel>
            <FormInput
              id={`dir-${index}`}
              placeholder="Calle, número, municipio, provincia"
              {...register(`deudores.${index}.direccionCompleta`)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor={`ocup-${index}`}>Estado ocupacional</FormLabel>
              <FormInput
                id={`ocup-${index}`}
                placeholder="Situación laboral y económica"
                {...register(`deudores.${index}.estadoOcupacional`)}
              />
            </div>
            <div>
              <FormLabel htmlFor={`vuln-${index}`}>Vulnerabilidad</FormLabel>
              <FormInput
                id={`vuln-${index}`}
                placeholder="Colectivo vulnerable, menores a cargo..."
                {...register(`deudores.${index}.vulnerabilidad`)}
              />
            </div>
          </div>

          <div>
            <FormLabel htmlFor={`notas-${index}`}>Notas</FormLabel>
            <textarea
              id={`notas-${index}`}
              rows={2}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Información adicional sobre este deudor..."
              {...register(`deudores.${index}.notas`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
type Props = {
  enrichmentId:      number;
  initialDeudores:   SelectEnrichmentDeudor[];
  onSeccionComplete?: (completa: boolean) => void;  // notifica al form padre
};

export default function EnrichmentSeccionE({ enrichmentId, initialDeudores, onSeccionComplete }: Props) {
  // Form context de EnrichmentFormValues (datos agregados sección E)
  const parentForm = useFormContext<EnrichmentFormValues>();

  // Form independiente para el array de deudores
  const methods = useForm<DeudoresFormInput>({
    defaultValues: {
      deudores: initialDeudores.map(d => ({
        esPrincipal:       d.esPrincipal,
        tipoRegistro:      d.tipoRegistro,
        nombre:            d.nombre,
        dni:               d.dni ?? '',
        direccionCompleta: d.direccionCompleta ?? '',
        estadoOcupacional: d.estadoOcupacional ?? '',
        vulnerabilidad:    d.vulnerabilidad ?? '',
        notas:             d.notas ?? '',
        otrosDatos:        d.otrosDatos ?? [],
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'deudores',
  });

  const [isPending, startTransition] = useTransition();

  function handleAddDeudor() {
    append({
      esPrincipal:       fields.length === 0, // el primero es principal por defecto
      tipoRegistro:      'DEUDOR',
      nombre:            '',
      dni:               '',
      direccionCompleta: '',
      estadoOcupacional: '',
      vulnerabilidad:    '',
      notas:             '',
      otrosDatos:        [],
    });
  }

  function handleGuardar() {
    const values = methods.getValues();
    startTransition(async () => {
      const result = await saveEnrichmentDeudoresAction(
        enrichmentId,
        values.deudores as DeudorInput[]
      );
      if (result.error) { toast.error(result.error); return; }
      toast.success(result.success);
      // Notificar al form padre para actualizar el badge de completitud
      if (onSeccionComplete) onSeccionComplete(result.seccionECompleta ?? false);
    });
  }

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        E. Deudores
      </h3>

      <p className="text-sm text-gray-500">
        Añade cada deudor, hipotecante o fiador vinculado a esta operación.
        Al promover a NPL estos registros se copiarán automáticamente a la tabla de deudores del activo.
      </p>

      <FormProvider {...methods}>
        <div className="space-y-3">
          {fields.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
              <User size={28} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Sin deudores registrados</p>
              <p className="mt-0.5 text-xs text-gray-400">Pulsa "Añadir deudor" para comenzar</p>
            </div>
          )}

          {fields.map((field, index) => (
            <DeudorPanel
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              methods={methods}
            />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleAddDeudor}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300
                       bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700
                       transition hover:bg-emerald-100"
          >
            <Plus size={15} />
            Añadir deudor
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={isPending || fields.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2
                       text-sm font-medium text-white shadow-sm transition
                       hover:bg-emerald-700 disabled:opacity-60"
          >
            {isPending ? 'Guardando...' : `Guardar deudores (${fields.length})`}
          </button>
        </div>
      </FormProvider>

      {/* ── Datos agregados de scoring (conservados) ─────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Scoring / Clasificación (datos agregados)
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <FormLabel htmlFor="situacionLaboral">Situación laboral</FormLabel>
            <select
              id="situacionLaboral"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...parentForm.register('situacionLaboral')}
            >
              <option value="">— Selecciona —</option>
              {SITUACIONES_LABORALES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel htmlFor="nivelIngresos">Nivel de ingresos</FormLabel>
            <select
              id="nivelIngresos"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...parentForm.register('nivelIngresos')}
            >
              <option value="">— Selecciona —</option>
              {NIVELES_INGRESOS.map(n => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel htmlFor="ratingSolvencia">Rating solvencia</FormLabel>
            <FormInput
              id="ratingSolvencia"
              placeholder="A, BBB, etc."
              {...parentForm.register('ratingSolvencia')}
            />
          </div>
        </div>
        <div>
          <FormLabel htmlFor="notasDeudores">Notas generales</FormLabel>
          <textarea
            id="notasDeudores"
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Valoración global de la situación del/los deudor/es..."
            {...parentForm.register('notasDeudores')}
          />
        </div>
      </div>
    </div>
  );
}
