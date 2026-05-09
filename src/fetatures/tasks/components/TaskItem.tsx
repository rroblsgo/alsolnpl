'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { Building2, User, Briefcase, Calendar, Tag, Clock } from 'lucide-react';
import { TaskListItem, TASK_CATEGORY_LABELS } from '../types/task.types';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskStatusBadge from './TaskStatusBadge';
import DeleteTaskDialog from './DeleteTaskDialog';

const fmt = (d: Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

type Props = { task: TaskListItem };

export default function TaskItem({ task }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  return (
    <>
      <DeleteTaskDialog
        taskId={task.id}
        taskTitle={task.title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />

      <li className="py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-6">

          {/* Contenido principal — más espacio */}
          <div className="min-w-0 flex-1 space-y-2">

            {/* Título + badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/tasks/${task.id}`}
                className="text-base font-bold text-gray-900 hover:text-orange-600"
              >
                {task.title}
              </Link>
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>

            {/* Descripción completa */}
            <p className="text-sm text-gray-500">{task.description}</p>

            {/* NPL vinculado */}
            {task.nplId && task.nplTitulo && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-600/20 ring-inset">
                  <Building2 className="h-3 w-3" />
                  NPL
                </span>
                <Link
                  href={`/dashboard/npl/${task.nplId}`}
                  className="text-xs text-indigo-600 hover:underline truncate max-w-[260px]"
                  title={task.nplTitulo}
                >
                  {task.nplTitulo}
                </Link>
              </div>
            )}

            {/* Meta row 1: expediente, comunidad, categoría */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                {task.expediente}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                {task.communityName}
              </span>
              <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                <Tag className="mr-1 h-3 w-3 self-center" />
                {TASK_CATEGORY_LABELS[task.category]}
              </span>
            </div>

            {/* Meta row 2: personas y fechas */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-400" />
                Creada por <span className="font-medium text-gray-700">{task.creatorName}</span>
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-gray-400" />
                Asignada a <span className="font-medium text-gray-700">{task.assigneeName}</span>
              </span>
              {fmt(task.fechaPropuesta) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Propuesta: <span className="font-medium text-gray-700">{fmt(task.fechaPropuesta)}</span>
                </span>
              )}
              {fmt(task.fechaLimite) && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  Límite: <span className="font-medium">{fmt(task.fechaLimite)}</span>
                </span>
              )}
            </div>
          </div>

          {/* Acciones — solo editar y eliminar */}
          <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:items-end">
            <Link
              href={`/dashboard/tasks/${task.id}/edit?returnTo=${encodeURIComponent(currentUrl)}` as Route}
              className="rounded-md bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-md border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </div>
        </div>
      </li>
    </>
  );
}
