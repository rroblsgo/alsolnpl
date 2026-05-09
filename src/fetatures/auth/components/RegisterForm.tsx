'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormSubmit,
} from '@/components/forms';
import { SignUpInput, SignUpSchema } from '../schemas/authSchema';
import { signUpAction } from '../actions/auth-actions';

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(SignUpSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignUpInput) => {
    const { error, success } = await signUpAction(data);
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(success);
      reset();
    }
  };

  return (
    <Form className="border rounded p-5" onSubmit={handleSubmit(onSubmit)}>
      <FormLabel htmlFor="email">Name</FormLabel>
      <FormInput
        type="name"
        id="name"
        placeholder="Ingresa tu Nombre"
        autoComplete="new-name"
        {...register('name')}
      />
      {errors.name && <FormError>{errors.name.message}</FormError>}
      <FormLabel htmlFor="email">E-mail</FormLabel>
      <FormInput
        type="email"
        id="email"
        placeholder="Ingresa tu E-mail"
        autoComplete="new-password"
        {...register('email')}
      />
      {errors.email && <FormError>{errors.email.message}</FormError>}
      <FormLabel htmlFor="password">Password</FormLabel>
      <FormInput
        type="password"
        id="password"
        placeholder="Ingresa tu Password (min. 8 caracteres)"
        autoComplete="new-password"
        {...register('password')}
      />
      {errors.password && <FormError>{errors.password.message}</FormError>}
      <FormLabel htmlFor="passwordConfirm">Repetir Password</FormLabel>
      <FormInput
        type="password"
        id="passwordConfirm"
        placeholder="Repite tu Password"
        autoComplete="new-password"
        {...register('passwordConfirm')}
      />
      {errors.passwordConfirm && (
        <FormError>{errors.passwordConfirm.message}</FormError>
      )}
      <FormSubmit value="Registrarse" className="text-white" />
    </Form>
  );
}
