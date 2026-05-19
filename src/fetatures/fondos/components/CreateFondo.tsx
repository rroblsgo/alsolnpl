'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FondoInput, FondoSchema } from '../schemas/fondoSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { createFondoAction } from '../actions/fondo-actions';
import FondoForm from './FondoForm';

export default function CreateFondo() {
  const router = useRouter();

  const methods = useForm<FondoInput>({
    resolver: zodResolver(FondoSchema),
    mode: 'all',
    defaultValues: {
      nombre: '', dni: '', empresa: '', nif: '', imagen: '',
      direccion: '', provincia: '', municipio: '', codigoPostal: '',
      emails: [], telefonos: [], contactos: [],
      comisionGestion: '',
      notas: '',
    },
  });

  const onSubmit = async (data: FondoInput) => {
    const { error, success } = await createFondoAction(data);
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
        <FormSubmit value="Crear fondo" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
