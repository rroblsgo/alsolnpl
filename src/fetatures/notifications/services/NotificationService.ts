import { SelectNotification } from '../types/notification.types';
import {
  INotificationRepository,
  notificationRepository,
} from './NotificationRepository';
import { notificationPusher } from './NotificationPusher';

export type TaskNotificationEvent = 'task_modified' | 'task_completed';

export interface TaskNotificationPayload {
  /** userId del creador de la tarea (destinatario) */
  creatorId: string;
  /** nombre del assignee que realiza la acción (actor) */
  actorName: string;
  /** título de la tarea */
  taskTitle: string;
  /** id de la tarea — se usa para construir el link en la notificación */
  taskId: number;
  /** tipo de evento */
  event: TaskNotificationEvent;
}

class NotificationService {
  constructor(private notificationRepository: INotificationRepository) {}

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async getUserNotifications(userId: string): Promise<SelectNotification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async clearNotifications(userId: string): Promise<void> {
    return this.notificationRepository.delete(userId);
  }

  async createTaskNotification(
    payload: TaskNotificationPayload
  ): Promise<void> {
    const { creatorId, actorName, taskTitle, taskId, event } = payload;

    const messageMap: Record<TaskNotificationEvent, string> = {
      task_modified: 'ha modificado la tarea',
      task_completed: 'ha completado la tarea',
    };

    // 1. Persistir en DB
    const notification = await this.notificationRepository.create({
      userId: creatorId,
      actorName,
      message: messageMap[event],
      target: taskTitle,
      type: event,
      taskId,
    });

    // 2. Emitir evento Pusher al canal privado del destinatario
    await notificationPusher.notify(notification);
  }
}

export const notificationService = new NotificationService(
  notificationRepository
);
