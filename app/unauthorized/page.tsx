import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Acceso restringido · AlsolNPL',
};

/**
 * Página /unauthorized
 *
 * Se muestra cuando el usuario tiene sesión activa pero su role
 * no tiene permisos para acceder a la zona solicitada.
 *
 * Diferencia con 404: el recurso existe, pero el usuario no tiene acceso.
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-red-50 dark:bg-red-950/30 p-4">
            <ShieldExclamationIcon
              className="size-10 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Texto */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Acceso restringido
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Tu cuenta no tiene permisos para acceder a esta sección.
          Si crees que esto es un error, contacta con el administrador de la plataforma.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-white/20 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Volver al inicio
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Acceder con otra cuenta
          </Link>
        </div>

        {/* Info de contacto */}
        <p className="mt-10 text-xs text-gray-400 dark:text-gray-600">
          AlsolNPL · Alsol Inmobiliaria · Uso interno
        </p>
      </div>
    </div>
  );
}
