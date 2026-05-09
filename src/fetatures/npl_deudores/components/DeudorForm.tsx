'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { DeudorInput } from '../schemas/deudorSchema';
import {
  NPL_TIPOS_REGISTRO,
  NPL_TIPO_REGISTRO_LABELS,
} from '@/src/fetatures/gestion_npl/types/npl.types';
import { Plus, Trash2 } from 'lucide-react';

export default function DeudorForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DeudorInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otrosDatos',
  });

  return (
    <div className="space-y-5">
      {/* Tipo de registro */}
      <div>
        <FormLabel htmlFor="tipoRegistro">Tipo de registro *</FormLabel>
        <select
          id="tipoRegistro"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          {...register('tipoRegistro')}
        >
          {NPL_TIPOS_REGISTRO.map((tipo) => (
            <option key={tipo} value={tipo}>
              {NPL_TIPO_REGISTRO_LABELS[tipo]}
            </option>
          ))}
        </select>
        {errors.tipoRegistro && (
          <FormError>{errors.tipoRegistro.message}</FormError>
        )}
      </div>

      {/* Nombre + DNI */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="nombre">Nombre completo *</FormLabel>
          <FormInput
            id="nombre"
            type="text"
            placeholder="Nombre y apellidos"
            {...register('nombre')}
          />
          {errors.nombre && <FormError>{errors.nombre.message}</FormError>}
        </div>
        <div>
          <FormLabel htmlFor="dni">DNI / NIF</FormLabel>
          <FormInput
            id="dni"
            type="text"
            placeholder="12345678A"
            {...register('dni')}
          />
        </div>
      </div>

      {/* Dirección */}
      <div>
        <FormLabel htmlFor="direccionCompleta">Dirección completa</FormLabel>
        <textarea
          id="direccionCompleta"
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Calle, número, municipio, provincia..."
          {...register('direccionCompleta')}
        />
      </div>

      {/* Estado ocupacional */}
      <div>
        <FormLabel htmlFor="estadoOcupacional">Estado ocupacional</FormLabel>
        <textarea
          id="estadoOcupacional"
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Ej. Reside el deudor. Acuerdo de desalojo tras subasta..."
          {...register('estadoOcupacional')}
        />
      </div>

      {/* Vulnerabilidad */}
      <div>
        <FormLabel htmlFor="vulnerabilidad">Vulnerabilidad</FormLabel>
        <textarea
          id="vulnerabilidad"
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Ej. No consta declaración de vulnerabilidad..."
          {...register('vulnerabilidad')}
        />
      </div>

      {/* Notas internas */}
      <div>
        <FormLabel htmlFor="notas">Notas internas</FormLabel>
        <textarea
          id="notas"
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Notas de gestión interna..."
          {...register('notas')}
        />
      </div>

      {/* Otros datos (array {titulo, nombre}) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <FormLabel>Otros datos</FormLabel>
          <button
            type="button"
            onClick={() => append({ titulo: '', nombre: '' })}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir dato
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-gray-400 italic">Sin datos adicionales.</p>
        )}

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="w-36 shrink-0">
                <FormInput
                  type="text"
                  placeholder="Título"
                  {...register(`otrosDatos.${index}.titulo`)}
                />
                {errors.otrosDatos?.[index]?.titulo && (
                  <FormError>
                    {errors.otrosDatos[index].titulo?.message}
                  </FormError>
                )}
              </div>
              <div className="flex-1">
                <FormInput
                  type="text"
                  placeholder="Valor"
                  {...register(`otrosDatos.${index}.nombre`)}
                />
                {errors.otrosDatos?.[index]?.nombre && (
                  <FormError>
                    {errors.otrosDatos[index].nombre?.message}
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

      {/* ¿Es el deudor principal? */}
      <div className="flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50 p-3">
        <input
          id="esPrincipal"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-orange-600"
          {...register('esPrincipal')}
        />
        <div>
          <FormLabel htmlFor="esPrincipal" className="mb-0 cursor-pointer font-semibold">
            Deudor principal
          </FormLabel>
          <p className="text-xs text-gray-500">
            Solo puede haber un deudor principal por NPL. Es el titular registral o ejecutado primario.
          </p>
        </div>
      </div>
    </div>
  );
}
