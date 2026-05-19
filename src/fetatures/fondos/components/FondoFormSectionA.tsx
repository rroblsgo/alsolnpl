'use client';

import { useFormContext } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { FondoInput } from '../schemas/fondoSchema';
import FondoImageUploader from './FondoImageUploader';
import ProvinciasMunicipiosSelectFondo from './ProvinciasMunicipiosSelectFondo';

export default function FondoFormSectionA() {
  const { register, formState: { errors } } = useFormContext<FondoInput>();

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        A. Datos básicos
      </h3>

      <div>
        <FormLabel>Imagen / Logotipo</FormLabel>
        <FondoImageUploader />
      </div>

      <div>
        <FormLabel htmlFor="nombre">Nombre del fondo *</FormLabel>
        <FormInput id="nombre" type="text" placeholder="Nombre del fondo o gestor" {...register('nombre')} />
        {errors.nombre && <FormError>{errors.nombre.message}</FormError>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="dni">DNI</FormLabel>
          <FormInput id="dni" type="text" placeholder="12345678A" {...register('dni')} />
        </div>
        <div>
          <FormLabel htmlFor="empresa">Empresa / Razón social</FormLabel>
          <FormInput id="empresa" type="text" placeholder="Razón social" {...register('empresa')} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="nif">NIF empresa</FormLabel>
          <FormInput id="nif" type="text" placeholder="B12345678" {...register('nif')} />
        </div>
        <div>
          <FormLabel htmlFor="codigoPostal">Código postal</FormLabel>
          <FormInput id="codigoPostal" type="text" maxLength={10} {...register('codigoPostal')} />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="direccion">Dirección</FormLabel>
        <FormInput id="direccion" type="text" placeholder="Calle, número, piso..." {...register('direccion')} />
      </div>

      <ProvinciasMunicipiosSelectFondo />
    </div>
  );
}
