'use server';

import { db } from '@/src/db';
import { task } from '@/src/db/schema/task';
import { requireAuth } from '@/src/lib/auth-server';
import type { TaskCategory, TaskPriority } from '@/src/db/schema/task';

export type CreateEnrichmentTaskInput = {
  enrichmentId:   number;
  operacionId:    number;
  expediente:     string;
  title:          string;
  description:    string;
  category:       TaskCategory;
  priority:       TaskPriority;
  assigneeId:     string;
  fechaPropuesta: string;   // 'YYYY-MM-DD'
  fechaLimite:    string;   // 'YYYY-MM-DD'
};

export async function createEnrichmentTaskAction(input: CreateEnrichmentTaskInput) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado', taskId: null };

  try {
    const [created] = await db
      .insert(task)
      .values({
        title:          input.title,
        description:    input.description,
        expediente:     input.expediente,
        category:       input.category,
        priority:       input.priority,
        status:         'PENDIENTE',
        enrichmentId:   input.enrichmentId,
        operacionId:    input.operacionId,
        creatorId:      session.user.id,
        assigneeId:     input.assigneeId,
        fechaPropuesta: new Date(input.fechaPropuesta),
        fechaLimite:    new Date(input.fechaLimite),
      })
      .returning({ id: task.id });

    return { success: 'Tarea creada', error: '', taskId: created.id };
  } catch (e) {
    return {
      success: '',
      error: e instanceof Error ? e.message : 'Error al crear la tarea',
      taskId: null,
    };
  }
}
