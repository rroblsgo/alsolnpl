import Link from 'next/link';
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import { documentService } from '@/src/fetatures/documents/services/DocumentService';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import TaskStatusBadge from '@/src/fetatures/tasks/components/TaskStatusBadge';
import TaskPriorityBadge from '@/src/fetatures/tasks/components/TaskPriorityBadge';
import DocumentsList from '@/src/fetatures/documents/components/DocumentsList';
import RichTextContent from '@/src/shared/components/ui/RichTextContent';
import { TASK_CATEGORY_LABELS } from '@/src/fetatures/tasks/types/task.types';
import { Building2, User, Briefcase, Calendar, Tag, Clock, Link2 } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

const fmt = (d: Date | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const task = await taskService.getTask(Number(id));
  return { title: generatePageTitle(task?.title ?? 'Tarea') };
}

function DataRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
        {icon}
        {value}
      </dd>
    </div>
  );
}

export default async function TaskDetailPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const taskId = Number(id);

  const task = await taskService.getTask(taskId);
  if (!task) notFound();

  // Fetch real names for creator and assignee
  const [creatorRow, assigneeRow, documents] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, task.creatorId)).limit(1),
    db.select({ name: users.name }).from(users).where(eq(users.id, task.assigneeId)).limit(1),
    documentService.listByEntity('TASK', taskId),
  ]);

  const creatorName = creatorRow[0]?.name ?? task.creatorId;
  const assigneeName = assigneeRow[0]?.name ?? task.assigneeId;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/tasks"
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
        >
          ← Volver a tareas
        </Link>
        <Link
          href={`/dashboard/tasks/${taskId}/edit`}
          className="rounded-lg border border-orange-400 px-6 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50"
        >
          Editar tarea
        </Link>
      </div>

      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="flex-1 text-xl font-bold text-gray-900">{task.title}</h1>
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>

        <p className="mt-3 text-sm text-gray-600">{task.description}</p>

        {/* NPL vinculado */}
        {task.nplId && (
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 ring-inset">
              <Building2 className="h-3.5 w-3.5" />
              NPL vinculado
            </span>
            <Link
              href={`/dashboard/npl/${task.nplId}`}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
            >
              <Link2 className="h-3.5 w-3.5" />
              Ver NPL →
            </Link>
          </div>
        )}

        {/* Grid de metadatos */}
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DataRow
            icon={<Briefcase className="h-3.5 w-3.5 text-gray-400" />}
            label="Expediente"
            value={task.expediente}
          />
          <DataRow
            icon={<Tag className="h-3.5 w-3.5 text-gray-400" />}
            label="Categoría"
            value={TASK_CATEGORY_LABELS[task.category]}
          />
          <DataRow
            icon={<User className="h-3.5 w-3.5 text-gray-400" />}
            label="Creada por"
            value={creatorName}
          />
          <DataRow
            icon={<User className="h-3.5 w-3.5 text-gray-400" />}
            label="Asignada a"
            value={assigneeName}
          />
          {fmt(task.fechaPropuesta) && (
            <DataRow
              icon={<Calendar className="h-3.5 w-3.5 text-gray-400" />}
              label="Fecha propuesta"
              value={fmt(task.fechaPropuesta)}
            />
          )}
          {fmt(task.fechaLimite) && (
            <DataRow
              icon={<Clock className="h-3.5 w-3.5 text-amber-500" />}
              label="Fecha límite"
              value={<span className="text-amber-700">{fmt(task.fechaLimite)}</span>}
            />
          )}
          {fmt(task.completedAt) && (
            <DataRow
              icon={<Calendar className="h-3.5 w-3.5 text-emerald-500" />}
              label="Completada"
              value={<span className="text-emerald-700">{fmt(task.completedAt)}</span>}
            />
          )}
          <DataRow
            icon={<Calendar className="h-3.5 w-3.5 text-gray-400" />}
            label="Creada"
            value={fmt(task.createdAt)}
          />
        </dl>
      </div>

      {/* ── Notas ───────────────────────────────────────────────────────── */}
      {task.notas && (
        <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Notas</h2>
          <RichTextContent html={task.notas} emptyText="Sin notas" />
        </div>
      )}

      {/* ── Documentos adjuntos ─────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Documentos adjuntos
        </h2>
        <DocumentsList documents={documents} />
      </div>
    </>
  );
}
