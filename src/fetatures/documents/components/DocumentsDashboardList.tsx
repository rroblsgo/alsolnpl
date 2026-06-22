'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Route } from 'next';
import { FileText, Search, Filter, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
} from '../types/document.types';
import { DocumentDashboardItem } from '../services/DocumentRepository';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const EXT_COLORS: Record<string, string> = {
  pdf:  'text-red-500',
  doc:  'text-blue-600', docx: 'text-blue-600',
  xls:  'text-green-600', xlsx: 'text-green-600',
  jpg:  'text-amber-500', jpeg: 'text-amber-500', png: 'text-amber-500',
};

const ENTITY_BADGE: Record<string, string> = {
  NPL:             'bg-indigo-100 text-indigo-700',
  TASK:            'bg-emerald-100 text-emerald-700',
  EXPEDIENTE_NOTA: 'bg-orange-100 text-orange-700',
};

const ENTITY_LABEL: Record<string, string> = {
  NPL:             'NPL',
  TASK:            'Tarea',
  EXPEDIENTE_NOTA: 'Expediente',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExtension(doc: DocumentDashboardItem) {
  return doc.extension ?? doc.nombreArchivo?.split('.').pop()?.toLowerCase() ?? '';
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Extrae uploaderName únicos de la lista, ordenados */
function getUploaders(docs: DocumentDashboardItem[]): string[] {
  const set = new Set(docs.map((d) => d.uploaderName).filter(Boolean) as string[]);
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}

/** Parsea una fecha ISO yyyy-mm-dd a inicio/fin de día */
function parseDateRange(from: string, to: string) {
  const dateFrom = from ? new Date(`${from}T00:00:00`) : null;
  const dateTo   = to   ? new Date(`${to}T23:59:59`)   : null;
  return { dateFrom, dateTo };
}

// ─── Sub-componente fila ──────────────────────────────────────────────────────

function DocumentRow({ doc }: { doc: DocumentDashboardItem }) {
  const ext  = getExtension(doc);
  const size = formatFileSize(doc.tamano);

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-orange-50/40 transition-colors">

      {/* Icono + título + archivo */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <FileText className={`mt-0.5 h-4 w-4 shrink-0 ${EXT_COLORS[ext] ?? 'text-gray-400'}`} />
        <div className="min-w-0">
          <Link
            href={`/dashboard/documents/${doc.id}`}
            className="block truncate text-sm font-semibold text-gray-900 hover:text-orange-600"
            title={doc.titulo}
          >
            {doc.titulo}
          </Link>
          {doc.nombreArchivo && (
            <span className="block truncate text-xs text-gray-400" title={doc.nombreArchivo}>
              {doc.nombreArchivo}{size && <span className="ml-1">· {size}</span>}
            </span>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div className="hidden w-32 shrink-0 sm:block">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {DOCUMENT_CATEGORY_LABELS[doc.categoria]}
        </span>
      </div>

      {/* Asociado a */}
      <div className="hidden w-44 shrink-0 lg:flex items-center gap-2">
        <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ENTITY_BADGE[doc.entityType]}`}>
          {ENTITY_LABEL[doc.entityType]}
        </span>
        {doc.entityTitle && (
          <a
            href={doc.entityEditUrl}
            className="truncate text-xs text-gray-500 hover:text-orange-600 hover:underline"
            title={doc.entityTitle}
          >
            {doc.entityTitle}
          </a>
        )}
      </div>

      {/* Subido por + fecha */}
      <div className="hidden w-24 shrink-0 xl:block">
        {doc.uploaderName && (
          <div className="text-xs text-gray-500 truncate" title={doc.uploaderName}>
            {doc.uploaderName}
          </div>
        )}
        <div className="text-xs text-gray-400">
          {new Date(doc.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={`/dashboard/documents/${doc.id}`}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-orange-600 ring-1 ring-orange-200 hover:bg-orange-50 whitespace-nowrap"
        >
          Ver / Editar
        </Link>
        <a
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          title="Abrir archivo"
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = {
  documents: DocumentDashboardItem[];
  uploaders: Array<{ id: string; name: string }>;
};

export default function DocumentsDashboardList({ documents, uploaders }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Estado local del input de búsqueda (debounced hacia URL) ─────────────
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  useEffect(() => { setSearchInput(searchParams.get('q') ?? ''); }, [searchParams]);
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch !== current) updateParams({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Leer todos los filtros desde la URL ───────────────────────────────────
  const search         = searchParams.get('q')        ?? '';
  const filterEntity   = searchParams.get('entity')   ?? '';
  const filterCategory = searchParams.get('cat')      ?? '';
  const filterUploader = searchParams.get('uploader') ?? '';
  const filterDateFrom = searchParams.get('desde')    ?? '';
  const filterDateTo   = searchParams.get('hasta')    ?? '';
  const page           = Number(searchParams.get('page') ?? '1');

  // ── Escribir en la URL ────────────────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '') params.delete(key);
        else params.set(key, value);
      });
      if (!('page' in updates)) params.delete('page');
      router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      updateParams({ [key]: e.target.value });

  const clearFilters = () =>
    updateParams({ q: '', entity: '', cat: '', uploader: '', desde: '', hasta: '' });

  const hasActiveFilters =
    !!search || !!filterEntity || !!filterCategory ||
    !!filterUploader || !!filterDateFrom || !!filterDateTo;

  // ── Filtrado client-side ──────────────────────────────────────────────────
  const { dateFrom, dateTo } = useMemo(
    () => parseDateRange(filterDateFrom, filterDateTo),
    [filterDateFrom, filterDateTo]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return documents.filter((doc) => {
      const matchSearch =
        !q ||
        doc.titulo.toLowerCase().includes(q) ||
        (doc.nombreArchivo ?? '').toLowerCase().includes(q) ||
        (doc.entityTitle ?? '').toLowerCase().includes(q) ||
        (doc.notas ?? '').toLowerCase().includes(q);

      const matchEntity   = !filterEntity   || doc.entityType === filterEntity;
      const matchCategory = !filterCategory || doc.categoria  === filterCategory;
      const matchUploader = !filterUploader || doc.uploaderName === filterUploader;

      const docDate = new Date(doc.createdAt);
      const matchFrom = !dateFrom || docDate >= dateFrom;
      const matchTo   = !dateTo   || docDate <= dateTo;

      return matchSearch && matchEntity && matchCategory && matchUploader && matchFrom && matchTo;
    });
  }, [documents, search, filterEntity, filterCategory, filterUploader, dateFrom, dateTo]);

  // ── Paginación ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(Math.max(1, page), totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage   = (p: number) => updateParams({ page: String(p) });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mt-8 space-y-4">

      {/* ── Panel de filtros ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white px-4 py-3 shadow-sm space-y-3">

        {/* Fila 1: búsqueda + contador + limpiar */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por título, archivo, entidad…"
              className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
          <span className="shrink-0 text-sm text-gray-400">
            {filtered.length} de {documents.length}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              title="Limpiar filtros"
              className="shrink-0 flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Fila 2: selectores */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 shrink-0 text-gray-400" />

          {/* Entidad asociada */}
          <select
            value={filterEntity}
            onChange={handleChange('entity')}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="">Todas las entidades</option>
            <option value="NPL">NPL</option>
            <option value="TASK">Tarea</option>
            <option value="EXPEDIENTE_NOTA">Expediente</option>
          </select>

          {/* Categoría */}
          <select
            value={filterCategory}
            onChange={handleChange('cat')}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>

          {/* Subido por */}
          <select
            value={filterUploader}
            onChange={handleChange('uploader')}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="">Todos los usuarios</option>
            {uploaders.map((u) => (
              <option key={u.id} value={u.name}>{u.name}</option>
            ))}
          </select>

          {/* Fecha desde */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-400 shrink-0">Desde</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={handleChange('desde')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
          </div>

          {/* Fecha hasta */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-400 shrink-0">Hasta</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={handleChange('hasta')}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Lista ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">
            {documents.length === 0
              ? 'Aún no hay documentos adjuntos.'
              : 'No hay resultados para los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Cabecera tabla */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="flex-1">Documento</div>
            <div className="hidden w-32 shrink-0 sm:block">Categoría</div>
            <div className="hidden w-44 shrink-0 lg:block">Asociado a</div>
            <div className="hidden w-24 shrink-0 xl:block">Subido por</div>
            <div className="w-24 shrink-0 text-right">Acciones</div>
          </div>
          {paginated.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* ── Paginación ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Página <span className="font-semibold">{safePage}</span> de{' '}
            <span className="font-semibold">{totalPages}</span>
            {' '}· {filtered.length} documentos
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
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-400">…</span>
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
