'use client';

import { Form, FormSubmit } from '@/src/shared/components/forms';
import MeetiForm from './MeetiForm';
import { FormProvider, useForm } from 'react-hook-form';
import { MeetiInput, MeetiSchema } from '../schemas/meetiSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectMeeti } from '../types/meeti.types';
import { editMeetiAction } from '../actions/meeti-actions';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';

type Props = {
  meeti: SelectMeeti;
};

export default function EditMeeti({ meeti }: Props) {
  const methods = useForm<MeetiInput>({
    resolver: zodResolver(MeetiSchema),
    mode: 'all',
    defaultValues: meeti.virtual
      ? {
          ...meeti,
          virtual: true,
        }
      : {
          ...meeti,
          location: meeti.location!,
        },
  });

  const onSubmit = async (data: MeetiInput) => {
    const { error, success } = await editMeetiAction(data, meeti.id);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
      redirect(`/dashboard/meetis`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)} className="mt-10">
        <MeetiForm />
        <FormSubmit value={'Actualizar'} />
      </Form>
    </FormProvider>
  );
}
