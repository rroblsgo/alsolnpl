'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { SignUpInput, SignUpSchema } from '../schemas/authSchema';
import { signUpAction } from '../actions/auth-actions';

export default function CreateUserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    mode: 'all',
  });

  const onSubmit = async (data: SignUpInput) => {
    const { error, success } = await signUpAction(data);
    if (error) {
      toast.error(error);
      return;
    }
    if (success) {
      toast.success(`Usuario creado. Se ha enviado un email de verificación.`);
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Nombre completo
        </label>
        <input
          type="text"
          id="name"
          placeholder="Nombre Apellidos"
          autoComplete="off"
          {...register('name')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

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
          placeholder="usuario@alsol.es"
          autoComplete="off"
          {...register('email')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
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
          Contraseña inicial
        </label>
        <input
          type="password"
          id="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          {...register('password')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirmar password */}
      <div>
        <label
          htmlFor="passwordConfirm"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="passwordConfirm"
          placeholder="Repite la contraseña"
          autoComplete="new-password"
          {...register('passwordConfirm')}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/20 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        {errors.passwordConfirm && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            {errors.passwordConfirm.message}
          </p>
        )}
      </div>

      {/* Nota informativa */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
        El usuario recibirá un email de verificación. Una vez verificado,
        actualiza su <code className="font-mono">role</code> en la base de datos
        para darle acceso a la plataforma.
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creando usuario...' : 'Crear usuario'}
      </button>
    </form>
  );
}
