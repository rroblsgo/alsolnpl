import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';
import Heading from '@/src/shared/components/typography/Heading';
import Link from 'next/link';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import CreateFondo from '@/src/fetatures/fondos/components/CreateFondo';

export const metadata: Metadata = { title: generatePageTitle('Nuevo fondo') };

export default async function CreateFondoPage() {
  await requireRole([ROLES.ADMIN]);

  return (
    <>
      <Heading className="text-center text-amber-500">Nuevo fondo</Heading>
      <Link href="/dashboard/fondos"
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-xl">
        ← Volver a fondos
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <CreateFondo />
      </div>
    </>
  );
}
