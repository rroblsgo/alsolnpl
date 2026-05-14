import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import TaskList from '@/src/fetatures/tasks/components/TaskList';

const title = 'Gestión de tareas';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function TasksPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const [tasks, options] = await Promise.all([
    taskService.listUserTasks(session.user),
    taskService.getTaskFormOptions(),
  ]);

  return (
    <>
      <Heading className="text-center">{title}</Heading>
      <div className="mt-5 flex justify-end">
        <Link
          href="/dashboard/tasks/create"
          className="rounded-lg bg-blue-700 px-8 py-3 text-xs font-bold text-white hover:bg-blue-800 lg:text-sm"
        >
          + Nueva tarea
        </Link>
      </div>
      <Suspense>
        <TaskList
          tasks={tasks}
          nplOptions={options.npls}
          clienteOptions={options.clientes}
        />
      </Suspense>
    </>
  );
}
