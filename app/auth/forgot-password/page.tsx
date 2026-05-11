import ForgotPasswordForm from '@/src/fetatures/auth/components/ForgotPasswordForm';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: generatePageTitle('Recuperar contraseña'),
};

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm dark:border-white/10 dark:bg-gray-900">
      {/* Cabecera */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Recupera tu acceso
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <ForgotPasswordForm />

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          ← Volver al acceso
        </Link>
      </div>
    </div>
  );
}
