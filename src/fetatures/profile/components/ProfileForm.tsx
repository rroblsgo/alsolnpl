'use client';

import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
  FormTextarea,
} from '@/src/shared/components/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { ProfileInput, ProfileSchema } from '../schemas/profileSchema';
import UploadImage from '@/src/shared/components/upload/UploadImage';
import { User } from '../../auth/types/auth.types';
import { updateProfileAction } from '../actions/profile-actions';
import toast from 'react-hot-toast';

type Props = {
  user: User;
};

export default function ProfileForm({ user }: Props) {
  const methods = useForm({
    resolver: zodResolver(ProfileSchema),
    mode: 'all',
    defaultValues: {
      name: user.name,
      bio: user.bio ?? '',
      image: user.image ?? '',
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: ProfileInput) => {
    const { error, success } = await updateProfileAction(data);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormLabel htmlFor="name">Nombre:</FormLabel>
        <FormInput
          id="name"
          type="text"
          placeholder="Tu Nombre"
          {...register('name')}
        />
        {errors.name && <FormError>{errors.name.message}</FormError>}

        <FormLabel id="bio">Biografía</FormLabel>
        <FormTextarea
          id="bio"
          placeholder="Añade una Descripción o Biografía"
          {...register('bio')}
        />
        {errors.bio && <FormError>{errors.bio.message}</FormError>}

        <FormLabel>Imagen perfil</FormLabel>
        <UploadImage uploadedImageLabel={'Imagen del Perfil'} />

        <FormSubmit value={'Guardar Cambios'} className="text-white" />
      </Form>
    </FormProvider>
  );
}
