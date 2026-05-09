'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Search, Filter, ExternalLink } from 'lucide-react';
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
} from '../types/document.types';
import { DocumentDashboardItem } from '../services/DocumentRepository';

function getExtension(doc: DocumentDashboardItem) {
  return doc.extension ?? doc.nombreArchivo?.split('.').pop()?.toLowerCase() ?? '';
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_COLORS: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-600', docx: 'text-blue-600',
  xls: 'text-green-600', xlsx: 'text-green-600',
  jpg: 'text-amber-500', jpeg: 'text-amber-500', png: 'text-amber-500',
};

const ENTITY_BADGE: Record<string, string> = {
  NPL: 'bg-indigo-100 text-indigo-700',
  TASK: 'bg-emerald-100 text-emerald-700',
};

const ENTITY_LABEL: Record<string, string> = {
  NPL: 'NPL',
  TASK: 'Tarea',
};

function DocumentRow({ doc }: { doc: DocumentDashboardItem }) {
  const ext = getExtension(doc);
  const size = formatFileSize(doc.tamano);

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-orange-50/40 transition-colors">

      {/* Icono + título + archivo — columna flexible */}
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

      {/* Categoría — oculta en móvil */}
      <div className="hidden w-32 shrink-0 sm:block">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {DOCUMENT_CATEGORY_LABELS[doc.categoria]}
        </span>
      </div>

      {/* Asociado a — oculta en pantallas pequeñas */}
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

      {/* Subido por — solo xl */}
      <div className="hidden w-20 shrink-0 xl:block">
        {doc.uploaderName && <div className="text-xs text-gray-500">{doc.uploaderName}</div>}
        <div className="text-xs text-gray-400">
          {new Date(doc.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </div>
      </div>

      {/* Acciones — siempre visibles, ancho fijo */}
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

type Props = { documents: DocumentDashboardItem[] };

export default function DocumentsDashboardList({ documents }: Props) {
  const [search, setSearch] = useState('');
  const [filterEntity, setFilterEntity] = useState<'ALL' | 'NPL' | 'TASK'>('ALL');
  const [filterCategory, setFilterCategory] = useState<'ALL' | DocumentCategory>('ALL');

  const filtered = documents.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      doc.titulo.toLowerCase().includes(q) ||
      (doc.nombreArchivo ?? '').toLowerCase().includes(q) ||
      (doc.entityTitle ?? '').toLowerCase().includes(q) ||
      (doc.notas ?? '').toLowerCase().includes(q);
    const matchEntity = filterEntity === 'ALL' || doc.entityType === filterEntity;
    const matchCategory = filterCategory === 'ALL' || doc.categoria === filterCategory;
    return matchSearch && matchEntity && matchCategory;
  });

  return (
    <div className="mt-8 space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, archivo, entidad…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-gray-400" />
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value as typeof filterEntity)}
            className="text-sm text-gray-700 focus:outline-none"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="NPL">NPL</option>
            <option value="TASK">Tarea</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
            className="text-sm text-gray-700 focus:outline-none"
          >
            <option value="ALL">Todas las categorías</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-400">{filtered.length} de {documents.length}</span>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">
            {documents.length === 0 ? 'Aún no hay documentos adjuntos.' : 'No hay resultados para esta búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Cabecera */}
          <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="flex-1">Documento</div>
            <div className="hidden w-32 shrink-0 sm:block">Categoría</div>
            <div className="hidden w-44 shrink-0 lg:block">Asociado a</div>
            <div className="hidden w-20 shrink-0 xl:block">Subido por</div>
            <div className="w-24 shrink-0 text-right">Acciones</div>
          </div>
          {filtered.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
