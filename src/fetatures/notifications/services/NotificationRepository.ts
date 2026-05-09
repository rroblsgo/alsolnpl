import { db } from '@/src/db';
import {
  InsertNotification,
  SelectNotification,
} from '../types/notification.types';
import { notifications } from '@/src/db/schema';
import { and, count, eq } from 'drizzle-orm';

export interface INotificationRepository {
  create(data: InsertNotification): Promise<SelectNotification>;
  getUnreadCount(userId: string): Promise<number>;
  findByUserId(userId: string): Promise<SelectNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  delete(userId: string): Promise<void>;
}

class NotificationRepository implements INotificationRepository {
  async create(data: InsertNotification): Promise<SelectNotification> {
    const [result] = await db.insert(notifications).values(data).returning();
    return result;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      );

    return result[0].count;
  }

  async findByUserId(userId: string): Promise<SelectNotification[]> {
    const result = await db.query.notifications.findMany({
      where: {
        AND: [{ userId: { eq: userId } }, { read: { eq: false } }],
      },
      limit: 20,
      orderBy: { createdAt: 'desc' },
    });
    return result;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async delete(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }
}

export const notificationRepository = new NotificationRepository();
