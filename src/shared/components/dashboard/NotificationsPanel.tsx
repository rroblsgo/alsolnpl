'use client';

import { BellIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PusherClient from 'pusher-js';
import { SelectNotification } from '@/src/fetatures/notifications/types/notification.types';

export default function NotificationsPanel({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);

  // Carga inicial del contador
  useEffect(() => {
    let cancelled = false;

    const loadCount = async () => {
      try {
        const res = await fetch('/api/user/notifications', {
          method: 'GET',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data);
      } catch (error) {
        console.error('NotificationsPanel fetch error:', error);
      }
    };

    loadCount();
    return () => { cancelled = true; };
  }, []);

  // Pusher: incrementa el badge cuando llega una notificación nueva
  useEffect(() => {
    if (!userId) return;

    const client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = client.subscribe(`notifications-channel-${userId}`);

    channel.bind('new-notification', (_data: SelectNotification) => {
      setCount((prev) => prev + 1);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`notifications-channel-${userId}`);
      client.disconnect();
    };
  }, [userId]);

  // Custom event: decrementa el badge cuando el usuario marca una como leída
  useEffect(() => {
    const handleRead = () => {
      setCount((prev) => Math.max(0, prev - 1));
    };

    window.addEventListener('notification-read', handleRead);
    return () => window.removeEventListener('notification-read', handleRead);
  }, []);

  return (
    <Link
      className="relative rounded-full p-1 text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:hover:text-white"
      href="/dashboard/notifications"
    >
      <span className="sr-only">Ver notificaciones</span>
      <BellIcon aria-hidden="true" className="size-6" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-2 text-xs text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
