'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { SignInInput, SignInSchema } from '../schemas/authSchema';
import { signInAction } from '../actions/auth-actions';
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
  } = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignInInput) => {
    if (locked) return;
    setLocked(true);
    const { error, success } = await signInAction(data);
    if (error) {
      toast.error(error);
      setLocked(false);
      return;
    }
    if (success) {
      toast.success(success);
      reset();
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          placeholder="tu@alsol.es"
          autoComplete="email"
          {...register('email')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || locked}
        className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting || locked ? 'Accediendo...' : 'Acceder'}
      </button>
    </form>
  );
}
