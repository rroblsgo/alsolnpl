import Heading from '@/components/typography/Heading';
import { requireAuth } from '@/src/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { isAuth } = await requireAuth();
  if (!isAuth) redirect('/auth/login');

  return (
    <>
      <Heading className="text-amber-500">Panel de Administración</Heading>
    </>
  );
}
