'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DeudorInput, DeudorSchema } from '../schemas/deudorSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { editDeudorAction } from '../actions/deudor-actions';
import DeudorForm from './DeudorForm';
import { SelectNplDeudor } from '../types/deudor.types';

type Props = {
  deudor: SelectNplDeudor;
  nplId: number;
};

export default function EditDeudor({ deudor, nplId }: Props) {
  const router = useRouter();

  const methods = useForm<DeudorInput>({
    resolver: zodResolver(DeudorSchema),
    mode: 'all',
    defaultValues: {
      nombre: deudor.nombre,
      dni: deudor.dni ?? '',
      esPrincipal: deudor.esPrincipal,
      tipoRegistro: deudor.tipoRegistro ?? 'DEUDOR',
      direccionCompleta: deudor.direccionCompleta ?? '',
      estadoOcupacional: deudor.estadoOcupacional ?? '',
      vulnerabilidad: deudor.vulnerabilidad ?? '',
      notas: deudor.notas ?? '',
      otrosDatos:
        (deudor.otrosDatos as { titulo: string; nombre: string }[]) ?? [],
    },
  });

  const onSubmit = async (data: DeudorInput) => {
    const { error, success } = await editDeudorAction(data, deudor.id, nplId);
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
        <FormSubmit value="Guardar cambios" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
