import ForgotPasswordForm from '@/src/fetatures/auth/components/ForgotPasswordForm';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: generatePageTitle('Reestablecer Password'),
};

export default function ForgotPasswordPage() {
  return (
    <>
      <Heading level={2} className="text-center text-amber-500">
        Recupera tu acceso a Meeti
      </Heading>
      <ForgotPasswordForm />
      <nav className="mt-5 flex items-center justify-between p-4 text-gray-500">
        <Link href={'/auth/login'} className="font-bold">
          Iniciar Sesión
        </Link>
        <Link href={'/auth/create-account'} className="font-bold">
          Crear Cuenta
        </Link>
      </nav>
    </>
  );
}
