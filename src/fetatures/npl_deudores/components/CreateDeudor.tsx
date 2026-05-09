'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DeudorInput, DeudorSchema } from '../schemas/deudorSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { createDeudorAction } from '../actions/deudor-actions';
import DeudorForm from './DeudorForm';

type Props = {
  nplId: number;
};

export default function CreateDeudor({ nplId }: Props) {
  const router = useRouter();

  const methods = useForm<DeudorInput>({
    resolver: zodResolver(DeudorSchema),
    mode: 'all',
    defaultValues: {
      nombre: '',
      dni: '',
      esPrincipal: false,
      tipoRegistro: 'DEUDOR',
      direccionCompleta: '',
      estadoOcupacional: '',
      vulnerabilidad: '',
      notas: '',
      otrosDatos: [],
    },
  });

  const onSubmit = async (data: DeudorInput) => {
    const { error, success } = await createDeudorAction(data, nplId);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push(`/dashboard/npl/${nplId}/deudores`);
      router.refresh();
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <DeudorForm />
        <FormSubmit value="Añadir deudor" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
