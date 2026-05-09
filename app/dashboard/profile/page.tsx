import ProfileForm from '@/src/fetatures/profile/components/ProfileForm';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const title = 'Administra tu Perfil';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function ProfilePage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  return (
    <>
      <Heading className="text-amber-500 ">{title}</Heading>
      <ProfileForm user={session.user} />
    </>
  );
}
