import Link from 'next/link';
import Logo from './Logo';
import GuestNavigation from './GuestNavigation';
import { requireAuth } from '@/src/lib/auth-server';
import UserNavigation from './UserNavigation';

export default async function Header() {
  const { isAuth } = await requireAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-gray-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link
            href="/#como-funciona"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cómo funciona
          </Link>
          <Link
            href="/#plataforma"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Plataforma
          </Link>
          <Link
            href="/npl"
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Activos
          </Link>
        </nav>

        {isAuth ? <UserNavigation /> : <GuestNavigation />}
      </div>
    </header>
  );
}
