'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import PusherClient from 'pusher-js';
import { SelectNotification } from '../types/notification.types';
import {
  CheckIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

type Props = {
  notifications: SelectNotification[];
  userId: string;
};

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  task_completed: {
    label: 'Completada',
    icon: <CheckIcon className="size-3.5" />,
    colorClass: 'bg-green-100 text-green-700',
  },
  task_modified: {
    label: 'Modificada',
    icon: <WrenchScrewdriverIcon className="size-3.5" />,
    colorClass: 'bg-amber-100 text-amber-700',
  },
  general: {
    label: 'Notificación',
    icon: <BellIcon className="size-3.5" />,
    colorClass: 'bg-gray-100 text-gray-600',
  },
  meeti_joined: {
    label: 'Meeti',
    icon: <BellIcon className="size-3.5" />,
    colorClass: 'bg-indigo-100 text-indigo-700',
  },
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: SelectNotification;
  onRead: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG['general'];
  const taskHref = notification.taskId
    ? (`/dashboard/tasks/${notification.taskId}` as Route)
    : null;

  const handleMarkAsRead = () => {
    startTransition(async () => {
      await fetch(`/api/user/notifications/${notification.id}`, {
        method: 'PATCH',
      });
      onRead(notification.id);
      window.dispatchEvent(new CustomEvent('notification-read'));
    });
  };

  const body = (
    <div className="space-y-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.colorClass}`}
      >
        {config.icon}
        {config.label}
      </span>
      <p className="text-sm text-gray-800 dark:text-gray-100">
        <span className="font-semibold">{notification.actorName}</span>{' '}
        {notification.message}{' '}
        <span className="font-bold">&ldquo;{notification.target}&rdquo;</span>
        {taskHref && (
          <ArrowTopRightOnSquareIcon className="ml-1.5 inline size-3.5 text-indigo-500" />
        )}
      </p>
      <p className="text-xs text-gray-400">
        {format(
          new Date(notification.createdAt),
          "d 'de' MMMM 'de' yyyy, HH:mm",
          { locale: es }
        )}
      </p>
    </div>
  );

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg bg-white p-4 shadow-xs shadow-gray-300 dark:bg-gray-800">
      <div className="flex-1">
        {taskHref ? (
          <Link
            href={taskHref}
            className="block rounded-md transition hover:bg-gray-50 dark:hover:bg-gray-700 -m-1 p-1"
          >
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
      <button
        onClick={handleMarkAsRead}
        disabled={isPending}
        title="Marcar como leída"
        className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <CheckIcon className="size-3.5" />
        {isPending ? 'Guardando…' : 'Leída'}
      </button>
    </div>
  );
}

export default function NotificationList({
  notifications: initial,
  userId,
}: Props) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    if (!userId) return;

    const client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = client.subscribe(`notifications-channel-${userId}`);

    channel.bind('new-notification', (notification: SelectNotification) => {
      setItems((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`notifications-channel-${userId}`);
      client.disconnect();
    };
  }, [userId]);

  const handleRead = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  };

  if (!items.length) {
    return (
      <p className="mt-10 text-center text-lg text-gray-600">
        No hay notificaciones pendientes
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-3">
      {items.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={handleRead}
        />
      ))}
    </div>
  );
}
