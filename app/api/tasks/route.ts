import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/auth-server';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { TaskSchema } from '@/src/fetatures/tasks/schemas/taskSchema';

export async function GET() {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const tasks = await taskService.listUserTasks(session.user);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const { session } = await requireAuth();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const data = TaskSchema.safeParse(body);
  if (!data.success) {
    return NextResponse.json({ error: data.error.flatten() }, { status: 400 });
  }

  const createdTask = await taskService.createTask(data.data, session.user.id);
  return NextResponse.json(createdTask, { status: 201 });
}
