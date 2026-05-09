'use client';

import { useFormContext } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { ClienteInput } from '../schemas/clienteSchema';
import ClienteImageUploader from './ClienteImageUploader';
import ProvinciasMunicipiosSelectCliente from './ProvinciasMunicipiosSelectCliente';

export default function ClienteFormSectionA() {
  const { register, formState: { errors } } = useFormContext<ClienteInput>();

  return (
    <div className="space-y-6">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        A. Datos básicos
      </h3>

      {/* Imagen */}
      <div>
        <FormLabel>Imagen</FormLabel>
        <ClienteImageUploader />
      </div>

      {/* Nombre */}
      <div>
        <FormLabel htmlFor="nombre">Nombre completo *</FormLabel>
        <FormInput id="nombre" type="text" placeholder="Nombre y apellidos" {...register('nombre')} />
        {errors.nombre && <FormError>{errors.nombre.message}</FormError>}
      </div>

      {/* DNI / Empresa / NIF */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="dni">DNI</FormLabel>
          <FormInput id="dni" type="text" placeholder="12345678A" {...register('dni')} />
        </div>
        <div>
          <FormLabel htmlFor="empresa">Empresa</FormLabel>
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

      {/* Dirección */}
      <div>
        <FormLabel htmlFor="direccion">Dirección</FormLabel>
        <FormInput id="direccion" type="text" placeholder="Calle, número, piso..." {...register('direccion')} />
      </div>

      {/* Provincia / Municipio en cascada */}
      <ProvinciasMunicipiosSelectCliente />
    </div>
  );
}
