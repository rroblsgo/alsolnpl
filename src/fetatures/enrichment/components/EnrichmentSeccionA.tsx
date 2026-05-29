import { useFormContext } from 'react-hook-form';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import { FormLabel, FormInput, FormError } from '@/src/shared/components/forms';

export default function EnrichmentSeccionA() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EnrichmentFormValues>();

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        A. Identificadores y referencias
      </h3>

      <p className="text-sm text-gray-500">
        Identificadores propios del fondo/banco originador. Los campos de expediente,
        préstamo e inmueble ID provienen de la cartera y no se modifican aquí.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Seller Reference */}
        <div>
          <FormLabel htmlFor="sellerReference">
            Referencia vendedor{' '}
            <span className="font-normal text-gray-400">(Seller Reference)</span>
          </FormLabel>
          <FormInput
            id="sellerReference"
            placeholder="Código interno del banco/fondo originador"
            {...register('sellerReference')}
          />
          <FormError>{errors.sellerReference?.message}</FormError>
        </div>

        {/* Original Lender */}
        <div>
          <FormLabel htmlFor="originalLender">
            Prestamista original{' '}
            <span className="font-normal text-gray-400">(Original Lender)</span>
          </FormLabel>
          <FormInput
            id="originalLender"
            placeholder="Entidad que concedió el préstamo original"
            {...register('originalLender')}
          />
          <FormError>{errors.originalLender?.message}</FormError>
        </div>

        {/* IDUFIR */}
        <div>
          <FormLabel htmlFor="idufir">
            IDUFIR{' '}
            <span className="font-normal text-gray-400">
              Identificador Único de Finca Registral
            </span>
          </FormLabel>
          <FormInput
            id="idufir"
            placeholder="ej: 28079000100000012345"
            className="font-mono"
            {...register('idufir')}
          />
          <FormError>{errors.idufir?.message}</FormError>
        </div>

        {/* CRU */}
        <div>
          <FormLabel htmlFor="cru">
            CRU{' '}
            <span className="font-normal text-gray-400">
              Código Registral Único
            </span>
          </FormLabel>
          <FormInput
            id="cru"
            placeholder="ej: 0505-2023-00001234"
            className="font-mono"
            {...register('cru')}
          />
          <FormError>{errors.cru?.message}</FormError>
        </div>
      </div>

      {/* Ayuda contextual */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>¿Dónde encontrar estos datos?</strong>
        <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-blue-700">
          <li>
            <strong>Referencia vendedor</strong> — en el Excel del fondo, columna de
            referencia interna del originador
          </li>
          <li>
            <strong>IDUFIR / CRU</strong> — en la nota simple del Registro de la
            Propiedad (primera hoja)
          </li>
        </ul>
      </div>
    </div>
  );
}
