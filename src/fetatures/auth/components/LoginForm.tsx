'use client';

import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
} from '@/components/forms';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { SignInInput, SignInSchema } from '../schemas/authSchema';
import { signInAction } from '../actions/auth-actions';
// import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const [locked, setLocked] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(SignInSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignInInput) => {
    if (locked) return;
    setLocked(true);

    const { error, success } = await signInAction(data);
    if (error) {
      toast.error(error);
      return;
    }
    if (success) {
      toast.success(success);
      reset();
      router.push('/dashboard');
      router.refresh();
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
        autoComplete="email"
        {...register('email')}
      />
      {errors.email && <FormError>{errors.email.message}</FormError>}
      <FormLabel htmlFor="password">Password</FormLabel>
      <FormInput
        type="password"
        id="password"
        placeholder="Ingresa tu Password"
        autoComplete="new-password"
        {...register('password')}
      />
      {errors.password && <FormError>{errors.password.message}</FormError>}
      <FormSubmit
        disabled={isSubmitting || locked}
        value={isSubmitting ? 'Ingresando...' : 'Iniciar Sesión'}
        className="text-white"
      />
    </Form>
  );
}
