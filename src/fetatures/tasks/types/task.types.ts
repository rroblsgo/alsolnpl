import { task } from '@/src/db/schema/task';
import { taskCategoryEnum, taskPriorityEnum, taskStatusEnum } from '@/src/db/schema';

export type InsertTask = typeof task.$inferInsert;
export type SelectTask = typeof task.$inferSelect;

export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
export type TaskPriority = (typeof taskPriorityEnum.enumValues)[number];
export type TaskCategory = (typeof taskCategoryEnum.enumValues)[number];

export const TASK_STATUSES = [...taskStatusEnum.enumValues] as const;
export const TASK_PRIORITIES = [...taskPriorityEnum.enumValues] as const;
export const TASK_CATEGORIES = [...taskCategoryEnum.enumValues] as const;

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  BLOQUEADA: 'Bloqueada',
  CANCELADA: 'Cancelada',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  DUE_DILIGENCE: 'Due diligence',
  LEGAL: 'Legal',
  VALORACION: 'Valoración',
  NEGOCIACION: 'Negociación',
  CATASTRO: 'Catastro',
  SUBASTA: 'Subasta',
  ADMINISTRATIVO: 'Administrativo',
  OTRO: 'Otro',
};

export type TaskListItem = SelectTask & {
  communityName: string;
  creatorName: string;
  assigneeName: string;
  nplTitulo: string | null;
};

export type TaskFormOptions = {
  communities: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; email: string }>;
  npls: Array<{ id: number; tituloOperacion: string }>;
};
