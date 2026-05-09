'use client';

import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
} from '@/components/forms';
import { useForm } from 'react-hook-form';
import {
  ForgotPasswordInput,
  ForgotPasswordSchema,
} from '../schemas/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordAction } from '../actions/auth-actions';
import toast from 'react-hot-toast';
// import { redirect } from 'next/navigation';

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    // reset,
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'all',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const { error, success } = await forgotPasswordAction(data);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
      // reset();
      // redirect('/dashboard');
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="border rounded p-5">
      <FormLabel htmlFor="email">E-mail</FormLabel>
      <FormInput
        type="email"
        id="email"
        placeholder="Ingresa tu E-mail"
        autoComplete="new-password"
        {...register('email')}
      />
      {errors.email && <FormError>{errors.email.message}</FormError>}

      <FormSubmit value="Enviar Instrucciones" className="text-white" />
    </Form>
  );
}
