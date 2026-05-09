'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Route } from 'next';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TaskListItem,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from '../types/task.types';
import TaskItem from './TaskItem';

const PAGE_SIZE = 10;

type NplOption = { id: number; tituloOperacion: string };

type Props = {
  tasks: TaskListItem[];
  nplOptions?: NplOption[];
  fixedNplId?: number;
};

export default function TaskList({
  tasks,
  nplOptions = [],
  fixedNplId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Estado local del input (respuesta inmediata al teclado) ─────────────
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch !== current) updateParams({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Leer filtros desde la URL ───────────────────────────────────────────
  const search = searchParams.get('q') ?? '';
  const filterStatus = searchParams.get('status') ?? 'ALL';
  const filterPriority = searchParams.get('priority') ?? 'ALL';
  const filterNpl = fixedNplId
    ? String(fixedNplId)
    : (searchParams.get('npl') ?? 'ALL');
  const dateFrom = searchParams.get('desde') ?? '';
  const dateTo = searchParams.get('hasta') ?? '';
  const filterCreator = searchParams.get('creator') ?? 'ALL';
  const filterAssignee = searchParams.get('assignee') ?? 'ALL';
  const page = Number(searchParams.get('page') ?? '1');

  // ── Escribir filtros en la URL ──────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === 'ALL') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Cualquier cambio de filtro vuelve a la página 1
      if (!('page' in updates)) params.delete('page');

      router.replace(`${pathname}?${params.toString()}` as Route, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      updateParams({ [key]: e.target.value });

  // ── Filtrado ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;

    return tasks.filter((t) => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchPriority =
        filterPriority === 'ALL' || t.priority === filterPriority;

      let matchNpl = true;
      if (filterNpl === 'WITH_NPL') matchNpl = t.nplId !== null;
      else if (filterNpl === 'WITHOUT_NPL') matchNpl = t.nplId === null;
      else if (filterNpl !== 'ALL') matchNpl = t.nplId === Number(filterNpl);

      const fp = t.fechaPropuesta ? new Date(t.fechaPropuesta) : null;
      const matchDateFrom = !from || (fp !== null && fp >= from);
      const matchDateTo = !to || (fp !== null && fp <= to);

      const matchCreator =
        filterCreator === 'ALL' || t.creatorId === filterCreator;
      const matchAssignee =
        filterAssignee === 'ALL' || t.assigneeId === filterAssignee;

      return (
        matchSearch &&
        matchStatus &&
        matchPriority &&
        matchNpl &&
        matchDateFrom &&
        matchDateTo &&
        matchCreator &&
        matchAssignee
      );
    });
  }, [
    tasks,
    search,
    filterStatus,
    filterPriority,
    filterNpl,
    dateFrom,
    dateTo,
    filterCreator,
    filterAssignee,
  ]);

  // ── Listas únicas de usuarios para los selects ─────────────────────────
  const creators = useMemo(() => {
    const seen = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.creatorId && t.creatorName) seen.set(t.creatorId, t.creatorName);
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [tasks]);

  const assignees = useMemo(() => {
    const seen = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assigneeId && t.assigneeName)
        seen.set(t.assigneeId, t.assigneeName);
    });
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [tasks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const goToPage = (p: number) => updateParams({ page: String(p) });

  if (tasks.length === 0) {
    return (
      <p className="mt-10 text-center text-lg">
        No hay tareas aún:{' '}
        <Link
          href="/dashboard/tasks/create"
          className="font-bold text-orange-500"
        >
          crea la primera
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* ── Barra de filtros ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white px-4 py-3 shadow-sm space-y-3">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título o descripción…"
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        {/* Selects + rango de fechas */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 shrink-0 text-gray-400" />

          <select
            value={filterStatus}
            onChange={handleChange('status')}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="ALL">Todos los estados</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={handleChange('priority')}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="ALL">Todas las prioridades</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          {creators.length > 1 && (
            <select
              value={filterCreator}
              onChange={handleChange('creator')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            >
              <option value="ALL">Todos los creadores</option>
              {creators.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {assignees.length > 1 && (
            <select
              value={filterAssignee}
              onChange={handleChange('assignee')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            >
              <option value="ALL">Todos los asignados</option>
              {assignees.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {!fixedNplId && (
            <select
              value={filterNpl}
              onChange={handleChange('npl')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            >
              <option value="ALL">Con o sin NPL</option>
              <option value="WITH_NPL">Con NPL vinculado</option>
              <option value="WITHOUT_NPL">Sin NPL</option>
              {nplOptions.length > 0 && (
                <optgroup label="── NPL específico ──">
                  {nplOptions.map((n) => (
                    <option key={n.id} value={String(n.id)}>
                      {n.tituloOperacion}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}

          {/* Rango de fecha propuesta */}
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-xs font-medium text-gray-400">
              F. propuesta:
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={handleChange('desde')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={handleChange('hasta')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} de {tasks.length} tareas
          </span>
        </div>
      </div>

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
          No hay tareas con los filtros seleccionados.
        </p>
      ) : (
        <ul
          role="list"
          className="divide-y divide-gray-100 rounded-xl bg-white px-6 shadow-sm"
        >
          {paginated.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      {/* ── Paginación ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Página <span className="font-semibold">{safePage}</span> de{' '}
            <span className="font-semibold">{totalPages}</span> ·{' '}
            {filtered.length} resultados
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`min-w-[2rem] rounded-md px-2 py-1 text-sm font-medium ${
                      p === safePage
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
