'use client';

import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
} from '@/components/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SetPasswordInput, SetPasswordSchema } from '../schemas/authSchema';
import { redirect, useSearchParams } from 'next/navigation';
import { setPasswordAction } from '../actions/auth-actions';
import toast from 'react-hot-toast';

export default function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  if (!token) redirect('/auth/forgot-password');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SetPasswordSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SetPasswordInput) => {
    const { error, success } = await setPasswordAction(data, token);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
      redirect('/auth/login');
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="border rounded p-5">
      <FormLabel htmlFor="newPassword">Nuevo Password</FormLabel>
      <FormInput
        id="newPassword"
        type="password"
        placeholder="Ingresa tu nuevo password"
        {...register('newPassword')}
      />
      {errors.newPassword && (
        <FormError>{errors.newPassword.message}</FormError>
      )}

      <FormLabel htmlFor="passwordConfirm">Repetir Password</FormLabel>
      <FormInput
        id="passwordConfirm"
        type="password"
        placeholder="Repite tu nuevo password"
        {...register('passwordConfirm')}
      />
      {errors.passwordConfirm && (
        <FormError>{errors.passwordConfirm.message}</FormError>
      )}

      <FormSubmit value="Restablecer password" className="text-white" />
    </Form>
  );
}
