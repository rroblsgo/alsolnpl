'use server';

import { requireAuth } from '@/src/lib/auth-server';
import {
  TaskInput,
  TaskSchema,
  UpdateTaskStatusInput,
  UpdateTaskStatusSchema,
} from '../schemas/taskSchema';
import { taskService } from '../services/TaskService';

export async function createTaskAction(input: TaskInput) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = TaskSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa la información del formulario' };
  }

  await taskService.createTask(data.data, session.user.id);
  return { success: 'Tarea creada correctamente', error: '' };
}

export async function editTaskAction(input: TaskInput, id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = TaskSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa la información del formulario' };
  }

  await taskService.updateTask(id, data.data, session.user);
  return { success: 'Tarea actualizada correctamente', error: '' };
}

export async function updateTaskStatusAction(input: UpdateTaskStatusInput, id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = UpdateTaskStatusSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Estado de tarea no válido' };
  }

  await taskService.updateTaskStatus(id, data.data.status, session.user);
  return { success: 'Estado actualizado correctamente', error: '' };
}

export async function deleteTaskAction(id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  await taskService.deleteTask(id, session.user);
  return { success: 'Tarea eliminada correctamente', error: '' };
}
