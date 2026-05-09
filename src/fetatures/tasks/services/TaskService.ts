import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { TaskInput } from '../schemas/taskSchema';
import { TaskPolicy } from '../policies/TaskPolicy';
import { ITaskRepository, taskRepository } from './TaskRepository';
import { SelectTask, TaskFormOptions, TaskStatus } from '../types/task.types';
import { notificationService } from '@/src/fetatures/notifications/services/NotificationService';

class TaskService {
  constructor(private taskRepository: ITaskRepository) {}

  async getTaskFormOptions(): Promise<TaskFormOptions> {
    const [communities, users, npls] = await Promise.all([
      this.taskRepository.listCommunityOptions(),
      this.taskRepository.listUserOptions(),
      this.taskRepository.listNplOptions(),
    ]);
    return { communities, users, npls };
  }

  async createTask(data: TaskInput, creatorId: string) {
    return this.taskRepository.create({
      ...data,
      notas: data.notas || null,
      nplId: data.nplId ?? null,
      fechaPropuesta: (data.fechaPropuesta as Date | null | undefined) ?? null,
      fechaLimite: (data.fechaLimite as Date | null | undefined) ?? null,
      creatorId,
      completedAt: data.status === 'COMPLETADA' ? new Date() : null,
    });
  }

  async getTask(taskId: number) {
    const currentTask = await this.taskRepository.findById(taskId);
    if (!currentTask) notFound();
    return currentTask;
  }

  async getTaskDetails(taskId: number, user: User) {
    const currentTask = await this.getTask(taskId);
    if (!TaskPolicy.canView(user, currentTask)) {
      throw new Error('No tienes permisos para ver esta tarea');
    }
    return currentTask;
  }

  async listUserTasks(_user: User) {
    return this.taskRepository.listAll();
  }

  async listAllTasks() {
    return this.taskRepository.listAll();
  }

  async listTasksByNpl(nplId: number) {
    return this.taskRepository.listByNpl(nplId);
  }

  async updateTask(taskId: number, data: TaskInput, user: User) {
    const currentTask = await this.getTask(taskId);
    if (!TaskPolicy.canEdit(user, currentTask)) {
      throw new Error('No tienes permisos para editar esta tarea');
    }

    const completedAt =
      data.status === 'COMPLETADA'
        ? (currentTask.completedAt ?? new Date())
        : null;

    const updatedTask = await this.taskRepository.update(taskId, {
      ...data,
      notas: data.notas || null,
      nplId: data.nplId ?? null,
      fechaPropuesta: (data.fechaPropuesta as Date | null | undefined) ?? null,
      fechaLimite: (data.fechaLimite as Date | null | undefined) ?? null,
      completedAt,
    } as Partial<SelectTask>);

    const isAssigneeActing = user.id === currentTask.assigneeId;
    const isDifferentUser = currentTask.creatorId !== currentTask.assigneeId;

    if (isAssigneeActing && isDifferentUser) {
      const event =
        data.status === 'COMPLETADA' ? 'task_completed' : 'task_modified';

      await notificationService.createTaskNotification({
        creatorId: currentTask.creatorId,
        actorName: user.name ?? user.email,
        taskTitle: currentTask.title,
        taskId,
        event,
      });
    }

    return updatedTask;
  }

  async updateTaskStatus(taskId: number, status: TaskStatus, user: User) {
    const currentTask = await this.getTask(taskId);
    if (!TaskPolicy.canChangeStatus(user, currentTask)) {
      throw new Error(
        'No tienes permisos para cambiar el estado de esta tarea'
      );
    }

    const completedAt = status === 'COMPLETADA' ? new Date() : null;
    const updatedTask = await this.taskRepository.updateStatus(
      taskId,
      status,
      completedAt
    );

    const isAssigneeActing = user.id === currentTask.assigneeId;
    const isDifferentUser = currentTask.creatorId !== currentTask.assigneeId;

    if (isAssigneeActing && isDifferentUser) {
      const event =
        status === 'COMPLETADA' ? 'task_completed' : 'task_modified';

      await notificationService.createTaskNotification({
        creatorId: currentTask.creatorId,
        actorName: user.name ?? user.email,
        taskTitle: currentTask.title,
        taskId,
        event,
      });
    }

    return updatedTask;
  }

  async deleteTask(taskId: number, user: User) {
    const currentTask = await this.getTask(taskId);
    if (!TaskPolicy.canDelete(user, currentTask)) {
      throw new Error('No tienes permisos para eliminar esta tarea');
    }
    await this.taskRepository.remove(taskId);
  }
}

export const taskService = new TaskService(taskRepository);
