import Heading from '@/components/typography/Heading';
import LoginForm from '@/src/fetatures/auth/components/LoginForm';
import { requireAuth } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/utils/metadata';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default async function LoginPage() {
  // Si el usuario ya está autenticado, redirige al dashboard
  const { isAuth } = await requireAuth();
  if (isAuth) redirect('/dashboard');

  return (
    <>
      <Heading level={2} className="text-center text-amber-500">
        Iniciar Sesión
      </Heading>
      <LoginForm />
      <nav className="mt-5 flex items-center justify-between p-4 text-gray-500">
        <Link href={'/auth/create-account'} className="font-bold">
          Crear Cuenta
        </Link>
        <Link href={'/auth/forgot-password'} className="font-bold">
          Olvidé mi password
        </Link>
      </nav>
    </>
  );
}
