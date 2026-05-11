import Link from 'next/link';

export default function UserNavigation() {
  return (
    <nav className="flex items-center gap-3 mt-5 md:mt-0">
      <Link
        href="/dashboard"
        className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        Panel de gestión
      </Link>
    </nav>
  );
}
