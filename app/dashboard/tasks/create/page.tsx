import Link from 'next/link';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CreateTask from '@/src/fetatures/tasks/components/CreateTask';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';

const title = 'Crear una tarea';

export const metadata: Metadata = {
  title: generatePageTitle(title),
};

export default async function CreateTaskPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const options = await taskService.getTaskFormOptions();

  return (
    <>
      <Heading className="text-center text-amber-500">{title}</Heading>
      <Link
        href="/dashboard/tasks"
        className="mt-5 block rounded-lg bg-orange-500 px-10 py-3 text-center text-xs font-bold text-white transition-colors hover:bg-orange-600 lg:inline-block lg:text-xl"
      >
        Volver a tareas
      </Link>
      <CreateTask options={options} />
    </>
  );
}
