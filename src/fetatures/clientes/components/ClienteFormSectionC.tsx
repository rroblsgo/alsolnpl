'use client';

import { useFormContext } from 'react-hook-form';
import { FormLabel } from '@/src/shared/components/forms';
import { ClienteInput } from '../schemas/clienteSchema';
import {
  CLIENTE_PERFILES, CLIENTE_PERFIL_LABELS,
  CLIENTE_OCUPACIONES, CLIENTE_OCUPACION_LABELS,
  CLIENTE_RANGOS_CAPITAL, CLIENTE_RANGO_CAPITAL_LABELS,
  ACTIVOS_INTERESADO_OPTIONS,
} from '../types/cliente.types';

export default function ClienteFormSectionC() {
  const { register, watch, setValue } = useFormContext<ClienteInput>();
  const activosSeleccionados = watch('activosInteresado') ?? [];

  const toggleActivo = (value: string) => {
    if (activosSeleccionados.includes(value)) {
      setValue('activosInteresado', activosSeleccionados.filter((a) => a !== value));
    } else {
      setValue('activosInteresado', [...activosSeleccionados, value]);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        C. Perfil inversor
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Perfil inversor */}
        <div>
          <FormLabel htmlFor="perfilInversor">Perfil inversor</FormLabel>
          <select
            id="perfilInversor"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('perfilInversor')}
          >
            <option value="">— Selecciona —</option>
            {CLIENTE_PERFILES.map((p) => (
              <option key={p} value={p}>{CLIENTE_PERFIL_LABELS[p]}</option>
            ))}
          </select>
        </div>

        {/* Ocupación */}
        <div>
          <FormLabel htmlFor="ocupacionPrincipal">Ocupación principal</FormLabel>
          <select
            id="ocupacionPrincipal"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('ocupacionPrincipal')}
          >
            <option value="">— Selecciona —</option>
            {CLIENTE_OCUPACIONES.map((o) => (
              <option key={o} value={o}>{CLIENTE_OCUPACION_LABELS[o]}</option>
            ))}
          </select>
        </div>

        {/* Rango de capital */}
        <div>
          <FormLabel htmlFor="rangoCapitalInvertir">Rango de capital a invertir</FormLabel>
          <select
            id="rangoCapitalInvertir"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('rangoCapitalInvertir')}
          >
            <option value="">— Selecciona —</option>
            {CLIENTE_RANGOS_CAPITAL.map((r) => (
              <option key={r} value={r}>{CLIENTE_RANGO_CAPITAL_LABELS[r]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activos de interés — multiselect con checkboxes */}
      <div>
        <FormLabel>Activos de interés</FormLabel>
        <div className="flex flex-wrap gap-2 mt-1">
          {ACTIVOS_INTERESADO_OPTIONS.map((opt) => {
            const selected = activosSeleccionados.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleActivo(opt.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experiencia previa */}
      <div>
        <FormLabel htmlFor="experienciaPreviaDetalle">Experiencia previa en inversión</FormLabel>
        <textarea
          id="experienciaPreviaDetalle"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Describe inversiones previas, tipología, importes aproximados..."
          {...register('experienciaPreviaDetalle')}
        />
      </div>

      {/* Cómo conoce los NPL */}
      <div>
        <FormLabel htmlFor="informadoNplDetalle">¿Cómo conoce los NPL?</FormLabel>
        <textarea
          id="informadoNplDetalle"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Referido, búsqueda online, evento, asesor financiero..."
          {...register('informadoNplDetalle')}
        />
      </div>
    </div>
  );
}
