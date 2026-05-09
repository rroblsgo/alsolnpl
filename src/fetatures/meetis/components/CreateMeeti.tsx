'use client';

import { Form, FormSubmit } from '@/src/shared/components/forms';
import MeetiForm from './MeetiForm';
import { useSession } from '@/src/lib/auth-client';
import { FormProvider, useForm } from 'react-hook-form';
import { MeetiInput, MeetiSchema } from '../schemas/meetiSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMeetiAction } from '../actions/meeti-actions';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';

export default function CreateMeeti() {
  const methods = useForm<MeetiInput>({
    resolver: zodResolver(MeetiSchema),
    mode: 'all',
    defaultValues: {
      title: '',
      details: '',
      categoryId: '',
      communityId: '',
      availableSeats: 0,
      date: '',
      time: '',
      image: '',
      virtual: false,
      location: {
        placeName: '',
        address: '',
        city: '',
        country: '',
        lat: 37.343668,
        lng: -6.043789,
      },
    },
  });

  const { isPending } = useSession();
  if (isPending) return <p>Cargando...</p>;

  const onSubmit = async (data: MeetiInput) => {
    const { success, error } = await createMeetiAction(data);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
      redirect('/dashboard/meetis');
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <MeetiForm />
        <FormSubmit value="crear meeti" className="text-white" />
      </Form>
    </FormProvider>
  );
}
