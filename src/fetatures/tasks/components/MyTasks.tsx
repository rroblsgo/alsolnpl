import Link from 'next/link';
import { requireAuth } from '@/src/lib/auth-server';
import { redirect } from 'next/navigation';
import { taskService } from '../services/TaskService';
import TaskItem from './TaskItem';

export default async function MyTasks() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const tasks = await taskService.listUserTasks(session.user);

  return tasks.length ? (
    <ul role="list" className="mt-10 divide-y divide-gray-100 rounded-lg bg-white p-8 shadow-lg">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  ) : (
    <p className="mt-10 text-center text-lg">
      No hay tareas aún:{' '}
      <Link href="/dashboard/tasks/create" className="font-bold text-orange-500">
        crea la primera
      </Link>
    </p>
  );
}
