import z from 'zod';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../types/task.types';

export const TaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: 'El título es obligatorio' })
    .max(200, { error: 'Máximo 200 caracteres' }),

  description: z
    .string()
    .trim()
    .min(5, { error: 'La descripción es obligatoria (mín. 5 caracteres)' })
    .max(500, { error: 'Máximo 500 caracteres' }),

  notas: z.string().trim().optional().or(z.literal('')),

  expediente: z
    .string()
    .trim()
    .min(2, { error: 'El expediente es obligatorio' })
    .max(100, { error: 'Máximo 100 caracteres' }),

  communityId: z.uuid({ error: 'Selecciona una comunidad válida' }),
  status: z.enum(TASK_STATUSES, { error: 'Selecciona un estado válido' }),
  priority: z.enum(TASK_PRIORITIES, { error: 'Selecciona una prioridad válida' }),
  category: z.enum(TASK_CATEGORIES, { error: 'Selecciona una categoría válida' }),
  assigneeId: z.string().trim().min(1, { error: 'Selecciona un responsable' }),
  nplId: z.number().int().positive().nullable().optional(),

  fechaPropuesta: z.coerce
    .date({ error: 'Fecha propuesta no válida' })
    .nullable()
    .optional(),
  fechaLimite: z.coerce
    .date({ error: 'Fecha límite no válida' })
    .nullable()
    .optional(),
});

export const UpdateTaskStatusSchema = z.object({
  status: z.enum([
    'COMPLETADA',
    'BLOQUEADA',
    'CANCELADA',
    'EN_CURSO',
    'PENDIENTE',
  ]),
});

export type TaskInput = z.input<typeof TaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
