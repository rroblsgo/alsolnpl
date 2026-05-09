'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { TaskListItem } from '../types/task.types';
import TaskItem from './TaskItem';
import TaskStatusBadge from './TaskStatusBadge';

type Props = {
  nplId: number;
  tasks: TaskListItem[];
};

export default function NplTasksSection({ nplId, tasks }: Props) {
  const [open, setOpen] = useState(false);

  const pending = tasks.filter((t) => t.status !== 'COMPLETADA' && t.status !== 'CANCELADA');
  const done = tasks.filter((t) => t.status === 'COMPLETADA' || t.status === 'CANCELADA');

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* ── Cabecera colapsable ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-orange-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            E. Tareas / Actuaciones
          </h2>
          {tasks.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {tasks.length}
            </span>
          )}
          {pending.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-400/30">
              {pending.length} activa{pending.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* ── Contenido ───────────────────────────────────────────────────── */}
      {open && (
        <div className="border-t px-6 pb-6">
          {/* Acceso rápido + botón nueva tarea */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {tasks.length === 0
                ? 'No hay actuaciones registradas para este NPL.'
                : `${tasks.length} actuación${tasks.length > 1 ? 'es' : ''} registrada${tasks.length > 1 ? 's' : ''}.`}
            </p>
            <Link
              href={`/dashboard/tasks/create?nplId=${nplId}`}
              className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
            >
              + Nueva actuación
            </Link>
          </div>

          {tasks.length > 0 && (
            <>
              {/* Tareas activas */}
              {pending.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Activas
                  </p>
                  <ul role="list" className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                    {pending.map((t) => (
                      <TaskItem key={t.id} task={t} />
                    ))}
                  </ul>
                </div>
              )}

              {/* Tareas cerradas */}
              {done.length > 0 && (
                <details className="mt-4 group">
                  <summary className="cursor-pointer list-none">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600">
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                      Completadas / canceladas ({done.length})
                    </span>
                  </summary>
                  <ul role="list" className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100 opacity-75">
                    {done.map((t) => (
                      <TaskItem key={t.id} task={t} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
