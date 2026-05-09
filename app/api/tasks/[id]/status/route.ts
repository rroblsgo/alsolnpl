import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/auth-server';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { UpdateTaskStatusSchema } from '@/src/fetatures/tasks/schemas/taskSchema';

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await props.params;
  const body = await request.json();
  const data = UpdateTaskStatusSchema.safeParse(body);
  if (!data.success) {
    return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
  }

  const updatedTask = await taskService.updateTaskStatus(Number(id), data.data.status, session.user);
  return NextResponse.json(updatedTask);
}
