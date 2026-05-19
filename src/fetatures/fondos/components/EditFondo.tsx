'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FondoInput, FondoSchema } from '../schemas/fondoSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { editFondoAction } from '../actions/fondo-actions';
import FondoForm from './FondoForm';
import { SelectFondo } from '../types/fondo.types';
import type { ContactoItem } from '@/src/db/schema/fondos';

type Props = { fondo: SelectFondo };

function parseContactos(raw: unknown): { titulo: string; valor: string }[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      titulo: String((item as ContactoItem).titulo ?? ''),
      valor:  String((item as ContactoItem).valor  ?? ''),
    }));
}

export default function EditFondo({ fondo }: Props) {
  const router = useRouter();

  const methods = useForm<FondoInput>({
    resolver: zodResolver(FondoSchema),
    mode: 'all',
    defaultValues: {
      nombre:       fondo.nombre,
      dni:          fondo.dni          ?? '',
      empresa:      fondo.empresa      ?? '',
      nif:          fondo.nif          ?? '',
      imagen:       fondo.imagen       ?? '',
      direccion:    fondo.direccion    ?? '',
      provincia:    fondo.provincia    ?? '',
      municipio:    fondo.municipio    ?? '',
      codigoPostal: fondo.codigoPostal ?? '',
      emails:       parseContactos(fondo.emails),
      telefonos:    parseContactos(fondo.telefonos),
      contactos:    parseContactos(fondo.contactos),
      comisionGestion: fondo.comisionGestion ?? '',
      notas:        fondo.notas        ?? '',
    },
  });

  const onSubmit = async (data: FondoInput) => {
    const { error, success } = await editFondoAction(data, fondo.id);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push('/dashboard/fondos');
      router.refresh();
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <FondoForm />
        <FormSubmit value="Guardar cambios" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
