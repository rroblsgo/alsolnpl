import { pusher } from '@/lib/pusher';
import { SelectNotification } from '../types/notification.types';

export interface INotificationPublisher {
  notify(notification: SelectNotification): Promise<void>;
}

class NotificationPusher implements INotificationPublisher {
  async notify(notification: SelectNotification): Promise<void> {
    await pusher.trigger(
      `notifications-channel-${notification.userId}`,
      'new-notification',
      notification
    );
  }
}

export const notificationPusher = new NotificationPusher();
