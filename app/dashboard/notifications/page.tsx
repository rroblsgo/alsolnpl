import NotificationList from '@/src/fetatures/notifications/components/NotificationList';
import { notificationService } from '@/src/fetatures/notifications/services/NotificationService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

// Nunca cachear: cada visita debe leer las notificaciones frescas de la DB
export const dynamic = 'force-dynamic';

const title = 'Tus notificaciones';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function NotificationsPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const notifications = await notificationService.getUserNotifications(
    session.user.id
  );

  return (
    <>
      <Heading>{title}</Heading>
      <NotificationList
        notifications={notifications}
        userId={session.user.id}
      />
    </>
  );
}
