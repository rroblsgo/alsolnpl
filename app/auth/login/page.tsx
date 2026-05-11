import LoginForm from '@/src/fetatures/auth/components/LoginForm';
import { requireAuth } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: generatePageTitle('Acceder'),
};

export default async function LoginPage() {
  const { isAuth } = await requireAuth();
  if (isAuth) redirect('/dashboard');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-white/10 dark:bg-gray-900">
      {/* Cabecera */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Accede a tu cuenta
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Introduce tus credenciales para continuar
        </p>
      </div>

      <LoginForm />

      {/* Solo enlace de recuperación */}
      <div className="mt-6 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
}
