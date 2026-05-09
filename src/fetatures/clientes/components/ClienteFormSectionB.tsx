'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormLabel } from '@/src/shared/components/forms';
import { ClienteInput } from '../schemas/clienteSchema';

type ContactoGroupProps = {
  label: string;
  fieldName: 'emails' | 'telefonos' | 'contactos';
  valuePlaceholder: string;
  tituloPlaceholder: string;
};

// Clases base compartidas con FormInput — replicadas aquí para control total del layout
const inputCls = 'border border-slate-300 p-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500';

function ContactoGroup({ label, fieldName, valuePlaceholder, tituloPlaceholder }: ContactoGroupProps) {
  const { register, control } = useFormContext<ClienteInput>();
  const { fields, append, remove } = useFieldArray({ control, name: fieldName });

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            {/* Título — ancho fijo */}
            <input
              type="text"
              placeholder={tituloPlaceholder}
              className={`${inputCls} w-36 shrink-0`}
              {...register(`${fieldName}.${index}.titulo` as const)}
            />
            {/* Valor — ocupa el espacio restante */}
            <input
              type="text"
              placeholder={valuePlaceholder}
              className={`${inputCls} min-w-0 flex-1`}
              {...register(`${fieldName}.${index}.valor` as const)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ titulo: '', valor: '' })}
          className="text-sm text-orange-600 hover:underline"
        >
          + Añadir {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

export default function ClienteFormSectionB() {
  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        B. Contacto
      </h3>

      <ContactoGroup
        label="Emails"
        fieldName="emails"
        tituloPlaceholder="Ej. Principal"
        valuePlaceholder="email@ejemplo.com"
      />

      <ContactoGroup
        label="Teléfonos"
        fieldName="telefonos"
        tituloPlaceholder="Ej. Móvil"
        valuePlaceholder="+34 600 000 000"
      />

      <ContactoGroup
        label="Otros contactos"
        fieldName="contactos"
        tituloPlaceholder="Ej. LinkedIn"
        valuePlaceholder="URL o usuario"
      />
    </div>
  );
}
