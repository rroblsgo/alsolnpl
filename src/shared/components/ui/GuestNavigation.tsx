import Link from 'next/link';

export default function GuestNavigation() {
  return (
    <nav className="flex items-center gap-3 mt-5 md:mt-0">
      <Link
        className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        href="/auth/login"
      >
        Acceder
      </Link>
      <Link
        className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        href="/auth/create-account"
      >
        Solicitar acceso
      </Link>
    </nav>
  );
}
