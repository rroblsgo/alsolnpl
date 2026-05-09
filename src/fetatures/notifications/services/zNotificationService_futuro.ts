import {
  InsertNotification,
  SelectNotification,
} from '../types/notification.types';
import {
  INotificationPublisher,
  notificationPusher,
} from './NotificationPusher';
import {
  INotificationRepository,
  notificationRepository,
} from './NotificationRepository';

export interface INotificationService {
  createAndNotify(data: InsertNotification): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
  getUserNotifications(userId: string): Promise<SelectNotification[]>;
  clearNotifications(userId: string): Promise<void>;
}

class NotificationService implements INotificationService {
  constructor(
    private notificationRepository: INotificationRepository,
    private notificationPusher: INotificationPublisher
  ) {}

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  async getUserNotifications(userId: string): Promise<SelectNotification[]> {
    return await this.notificationRepository.findByUserId(userId);
  }

  async clearNotifications(userId: string): Promise<void> {
    return await this.notificationRepository.delete(userId);
  }

  async createAndNotify(data: InsertNotification): Promise<void> {
    const notification = await this.notificationRepository.create(data);
    await this.notificationPusher.notify(notification);
  }
}

export const notificationService = new NotificationService(
  notificationRepository,
  notificationPusher
);
