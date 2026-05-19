'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { FormLabel } from '@/src/shared/components/forms';
import { FondoInput } from '../schemas/fondoSchema';
import NplRichTextEditor from '@/src/fetatures/gestion_npl/components/NplRichTextEditor';

export default function FondoFormSectionD() {
  const { control } = useFormContext<FondoInput>();

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">D. Gestión interna</h3>
      <div>
        <FormLabel>Notas internas</FormLabel>
        <Controller
          control={control}
          name="notas"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Observaciones, historial de relación, condiciones especiales..."
            />
          )}
        />
      </div>
    </div>
  );
}
