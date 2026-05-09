import Link from 'next/link';
import type { Route } from 'next';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EditTask from '@/src/fetatures/tasks/components/EditTask';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import DocumentsPanel from '@/src/fetatures/documents/components/DocumentsPanel';
import { documentService } from '@/src/fetatures/documents/services/DocumentService';

export async function generateMetadata(
  props: PageProps<'/dashboard/tasks/[id]/edit'>
): Promise<Metadata> {
  const { id } = await props.params;
  const task = await taskService.getTask(Number(id));
  return {
    title: generatePageTitle(`Editar tarea - ${task.title}`),
    description: task.description,
  };
}

export default async function EditTaskPage(
  props: PageProps<'/dashboard/tasks/[id]/edit'>
) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await props.params;
  const searchParams = await (props as { searchParams?: Promise<{ returnTo?: string }> }).searchParams;
  const returnTo = searchParams?.returnTo;
  const taskId = Number(id);
  const [task, options, documents] = await Promise.all([
    taskService.getTaskDetails(taskId, session.user),
    taskService.getTaskFormOptions(),
    documentService.listByEntity('TASK', taskId),
  ]);

  return (
    <>
      <Heading className="text-center text-amber-500">
        Editar tarea: {task.title}
      </Heading>
      <div className="mt-5 flex gap-3">
        <Link
          href={(returnTo ?? "/dashboard/tasks") as Route}
          className="rounded-lg bg-orange-500 px-8 py-3 text-xs font-bold text-white hover:bg-orange-600 lg:text-sm"
        >
          ← Volver a tareas
        </Link>
        <Link
          href={`/dashboard/tasks/${taskId}`}
          className="rounded-lg border border-orange-400 px-8 py-3 text-xs font-bold text-orange-600 hover:bg-orange-50 lg:text-sm"
        >
          Ver detalle
        </Link>
      </div>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <EditTask task={task} options={options} returnTo={returnTo} />
      </div>

      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-base font-bold text-gray-900">Documentos adjuntos</h2>
        <p className="mb-6 text-sm text-gray-500">
          Añade PDFs, imágenes u otros documentos relacionados con esta tarea.
        </p>
        <DocumentsPanel
          entityType="TASK"
          entityId={taskId}
          initialDocuments={documents}
          uploadEndpoint="taskAttachmentsUploader"
          uploaderLabel="PDF, Word, imágenes u otros archivos"
          uploaderAllowedContent="Máximo 5 archivos de 8 MB"
        />
      </div>
    </>
  );
}
