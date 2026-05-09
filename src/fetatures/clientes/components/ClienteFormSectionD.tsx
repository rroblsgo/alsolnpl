'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import { ClienteInput } from '../schemas/clienteSchema';
import {
  CLIENTE_ESTADOS, CLIENTE_ESTADO_LABELS,
  CLIENTE_FUENTES, CLIENTE_FUENTE_LABELS,
} from '../types/cliente.types';
import NplRichTextEditor from '@/src/fetatures/gestion_npl/components/NplRichTextEditor';

export default function ClienteFormSectionD() {
  const { register, watch, control } = useFormContext<ClienteInput>();
  const consentimiento = watch('consentimientoRgpd');

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        D. Gestión interna
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Estado */}
        <div>
          <FormLabel htmlFor="estado">Estado del cliente</FormLabel>
          <select
            id="estado"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('estado')}
          >
            {CLIENTE_ESTADOS.map((e) => (
              <option key={e} value={e}>{CLIENTE_ESTADO_LABELS[e]}</option>
            ))}
          </select>
        </div>

        {/* Fuente de captación */}
        <div>
          <FormLabel htmlFor="fuenteCaptacion">Fuente de captación</FormLabel>
          <select
            id="fuenteCaptacion"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('fuenteCaptacion')}
          >
            <option value="">— Selecciona —</option>
            {CLIENTE_FUENTES.map((f) => (
              <option key={f} value={f}>{CLIENTE_FUENTE_LABELS[f]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notas internas — editor TipTap */}
      <div>
        <FormLabel>Notas internas</FormLabel>
        <Controller
          control={control}
          name="notas"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Observaciones, historial de contactos, preferencias específicas..."
            />
          )}
        />
      </div>

      {/* RGPD */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-blue-900">Consentimiento RGPD</h4>

        <div className="flex items-start gap-3">
          <input
            id="consentimientoRgpd"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600"
            {...register('consentimientoRgpd')}
          />
          <FormLabel htmlFor="consentimientoRgpd" className="mb-0 cursor-pointer text-sm text-blue-800">
            El cliente ha otorgado consentimiento para el tratamiento de sus datos personales
            con fines comerciales (Reglamento UE 2016/679)
          </FormLabel>
        </div>

        {consentimiento && (
          <div>
            <FormLabel htmlFor="fechaConsentimiento">Fecha de consentimiento</FormLabel>
            <FormInput
              id="fechaConsentimiento"
              type="date"
              className="max-w-xs"
              {...register('fechaConsentimiento')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
