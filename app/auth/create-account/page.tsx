import RegisterForm from '@/src/fetatures/auth/components/RegisterForm';
import Heading from '@/components/typography/Heading';
import { generatePageTitle } from '@/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: generatePageTitle('Crear Cuenta'),
};

export default function RegisterPage() {
  return (
    <>
      <Heading level={2} className="text-center text-amber-500">
        Crear Cuenta
      </Heading>
      <RegisterForm />
      <nav className="mt-5 flex items-center justify-between p-4 text-gray-500">
        <Link href={'/auth/login'} className="font-bold">
          Iniciar Sesión
        </Link>
        <Link href={'/auth/forgot-password'} className="font-bold">
          Olvidé mi password
        </Link>
      </nav>
    </>
  );
}
