import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/auth-server';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { TaskSchema } from '@/src/fetatures/tasks/schemas/taskSchema';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await props.params;
  const body = await request.json();
  const data = TaskSchema.safeParse(body);
  if (!data.success) {
    return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
  }

  const updatedTask = await taskService.updateTask(Number(id), data.data, session.user);
  return NextResponse.json(updatedTask);
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = await props.params;
  await taskService.deleteTask(Number(id), session.user);

  return NextResponse.json({ success: true });
}
