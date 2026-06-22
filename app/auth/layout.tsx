import Link from 'next/link';
import Logo from '@/src/shared/components/ui/Logo';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 print:bg-white">
      {/* Logo centrado */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </div>

      {/* Contenedor de la tarjeta */}
      <div className="mx-auto w-full max-w-md">{children}</div>

      {/* Pie */}
      <p className="mt-10 text-center text-xs text-gray-400 dark:text-gray-600">
        &copy; {new Date().getFullYear()} Alsol Inmobiliaria · Uso interno
      </p>
    </div>
  );
}
