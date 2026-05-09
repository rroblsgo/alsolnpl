'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, ExternalLink, Pencil, Trash2, Check, X,
  Calendar, User, Tag, Link2, ChevronDown,
} from 'lucide-react';
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentListItem,
} from '../types/document.types';
import {
  updateDocumentAction,
  deleteDocumentAction,
} from '../actions/document-actions';

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

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  doc: DocumentListItem;
  entityTitle: string | null;
  entityEditUrl: string;
};

export default function DocumentDetailCard({ doc, entityTitle, entityEditUrl }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(doc.titulo);
  const [categoria, setCategoria] = useState<DocumentCategory>(doc.categoria);
  const [notas, setNotas] = useState(doc.notas ?? '');
  const [isPending, startTransition] = useTransition();

  const ext = doc.extension ?? doc.nombreArchivo?.split('.').pop()?.toLowerCase() ?? '';
  const size = formatFileSize(doc.tamano);

  const handleSave = () => {
    startTransition(async () => {
      await updateDocumentAction(doc.id, { titulo, categoria, notas });
      setEditing(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el documento "${titulo}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteDocumentAction(doc.id);
      router.push('/dashboard/documents');
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Tarjeta principal ── */}
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-start justify-between gap-4">
          {/* Icono + título */}
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50">
              <FileText className={`h-6 w-6 ${EXT_COLORS[ext] ?? 'text-gray-400'}`} />
            </div>
            <div className="min-w-0">
              {editing ? (
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-lg font-bold focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
              )}
              {doc.nombreArchivo && (
                <p className="mt-0.5 text-sm text-gray-400">
                  {doc.nombreArchivo}{size && <span className="ml-1">· {size}</span>}
                </p>
              )}
            </div>
          </div>

          {/* Botones edición / eliminación */}
          <div className="flex shrink-0 gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={isPending || !titulo.trim()}
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Guardar
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setTitulo(doc.titulo); setCategoria(doc.categoria); setNotas(doc.notas ?? ''); }}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-md border border-red-100 px-3 py-1.5 text-sm font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Metadatos ── */}
        <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Categoría */}
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Tag className="h-3.5 w-3.5" /> Categoría
            </dt>
            <dd className="mt-1">
              {editing ? (
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
                    className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {DOCUMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700">
                  {DOCUMENT_CATEGORY_LABELS[categoria]}
                </span>
              )}
            </dd>
          </div>

          {/* Entidad asociada */}
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Link2 className="h-3.5 w-3.5" /> Asociado a
            </dt>
            <dd className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ENTITY_BADGE[doc.entityType]}`}>
                {doc.entityType === 'NPL' ? 'NPL' : 'Tarea'}
              </span>
              {entityTitle && (
                <a
                  href={entityEditUrl}
                  className="text-sm text-orange-600 hover:underline"
                >
                  {entityTitle}
                </a>
              )}
            </dd>
          </div>

          {/* Subido por */}
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <User className="h-3.5 w-3.5" /> Subido por
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {doc.uploaderName ?? '—'}
            </dd>
          </div>

          {/* Fechas */}
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Calendar className="h-3.5 w-3.5" /> Subido el
            </dt>
            <dd className="mt-1 text-sm text-gray-700">
              {new Date(doc.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </dd>
          </div>

          {doc.updatedAt > doc.createdAt && (
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <Calendar className="h-3.5 w-3.5" /> Actualizado
              </dt>
              <dd className="mt-1 text-sm text-gray-700">
                {new Date(doc.updatedAt).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </dd>
            </div>
          )}
        </dl>

        {/* ── Notas ── */}
        <div className="mt-6">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Notas
          </dt>
          <dd className="mt-1">
            {editing ? (
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Observaciones sobre este documento…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            ) : (
              <p className="text-sm text-gray-600 italic">
                {notas || <span className="not-italic text-gray-400">Sin notas</span>}
              </p>
            )}
          </dd>
        </div>
      </div>

      {/* ── Botón abrir archivo ── */}
      <a
        href={doc.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
      >
        <ExternalLink className="h-5 w-5" />
        Abrir archivo
      </a>
    </div>
  );
}
