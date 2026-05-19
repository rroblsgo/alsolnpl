'use client';

import { useFormContext } from 'react-hook-form';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import { FondoInput } from '../schemas/fondoSchema';

export default function FondoFormSectionC() {
  const { register } = useFormContext<FondoInput>();

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">C. Perfil inversor</h3>
      <div>
        <FormLabel htmlFor="comisionGestion">Comisión de gestión (%)</FormLabel>
        <FormInput
          id="comisionGestion"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Ej. 1.5"
          className="max-w-xs"
          {...register('comisionGestion')}
        />
        <p className="mt-1 text-xs text-gray-500">Comisión de gestión habitual del fondo (porcentaje)</p>
      </div>
    </div>
  );
}
