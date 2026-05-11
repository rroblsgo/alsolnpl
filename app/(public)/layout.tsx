import Header from '@/src/shared/components/ui/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlsolNPL · Gestión de activos NPL',
  description:
    'Plataforma de gestión de Non-Performing Loans (NPL) e inmuebles en proceso de ejecución hipotecaria.',
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>

      <footer className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Marca */}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Alsol<span className="text-blue-700 dark:text-blue-400">NPL</span>
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Plataforma de gestión de activos NPL para Alsol Inmobiliaria.
              </p>
            </div>

            {/* Accesos */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Plataforma
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { label: 'Gestión NPL', href: '/dashboard/npl' },
                  { label: 'Clientes', href: '/dashboard/clientes' },
                  { label: 'Tareas', href: '/dashboard/tasks' },
                  { label: 'Documentos', href: '/dashboard/documents' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contacto
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a
                    href="https://www.alsolweb.eu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    alsolweb.eu
                  </a>
                </li>
                <li>
                  <a
                    href="/auth/login"
                    className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Acceder a la plataforma
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} Alsol Inmobiliaria. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Uso interno · Datos confidenciales
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
