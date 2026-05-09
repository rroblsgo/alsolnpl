'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Pencil,
  Check,
  X,
  Trash2,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DocumentListItem,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORIES,
  DocumentCategory,
  DocumentEntityType,
} from '../types/document.types';
import {
  updateDocumentAction,
  deleteDocumentAction,
} from '../actions/document-actions';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_COLOR: Record<string, string> = {
  pdf: 'text-red-500',
  doc: 'text-blue-600',
  docx: 'text-blue-600',
  xls: 'text-green-600',
  xlsx: 'text-green-600',
  jpg: 'text-amber-500',
  jpeg: 'text-amber-500',
  png: 'text-amber-500',
};

const ENTITY_HREF: Record<DocumentEntityType, (id: number) => string> = {
  NPL: (id) => `/dashboard/npl/${id}`,
  TASK: (id) => `/dashboard/tasks/${id}/edit`,
};

const ENTITY_LABELS: Record<DocumentEntityType, string> = {
  NPL: 'NPL',
  TASK: 'Tarea',
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  doc: DocumentListItem;
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DocumentDetail({ doc }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(doc.titulo);
  const [categoria, setCategoria] = useState<DocumentCategory>(doc.categoria);
  const [notas, setNotas] = useState(doc.notas ?? '');
  const [isPending, startTransition] = useTransition();

  const ext = doc.extension ?? doc.nombreArchivo?.split('.').pop()?.toLowerCase() ?? '';
  const entityHref = ENTITY_HREF[doc.entityType](doc.entityId);

  const handleSave = () => {
    if (!titulo.trim()) return;
    startTransition(async () => {
      const result = await updateDocumentAction(doc.id, { titulo, categoria, notas });
      if (result.success) {
        toast.success(result.success);
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el documento "${doc.titulo}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await deleteDocumentAction(doc.id);
      if (result.success) {
        toast.success(result.success);
        router.push('/dashboard/documents');
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText
            className={`h-8 w-8 shrink-0 ${EXT_COLOR[ext] ?? 'text-gray-400'}`}
          />
          <div>
            {editing ? (
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="text-xl font-bold text-gray-900 border-b-2 border-orange-400 bg-transparent focus:outline-none w-full"
                autoFocus
              />
            ) : (
              <h1 className="text-xl font-bold text-gray-900">{titulo}</h1>
            )}
            <p className="mt-0.5 text-sm text-gray-500">
              {doc.nombreArchivo && <span className="mr-3">{doc.nombreArchivo}</span>}
              {doc.tamano && <span>{formatFileSize(doc.tamano)}</span>}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 gap-2">
          {editing ? (
            <>
              <button
                type="button"
                disabled={isPending || !titulo.trim()}
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setTitulo(doc.titulo);
                  setCategoria(doc.categoria);
                  setNotas(doc.notas ?? '');
                }}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              >
                <Pencil className="h-4 w-4" /> Editar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Datos ───────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2">

        {/* Categoría */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Categoría
          </p>
          {editing ? (
            <div className="relative mt-2">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-orange-400 focus:outline-none"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {DOCUMENT_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          ) : (
            <p className="mt-1 text-sm font-medium text-gray-900">
              {DOCUMENT_CATEGORY_LABELS[categoria]}
            </p>
          )}
        </div>

        {/* Entidad asociada */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Asociado a
          </p>
          <a
            href={entityHref}
            className="mt-1 flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline"
          >
            {ENTITY_LABELS[doc.entityType]} #{doc.entityId}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Fecha de subida */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Subido el
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {new Date(doc.createdAt).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Subido por */}
        {doc.uploaderName && (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Subido por
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {doc.uploaderName}
            </p>
          </div>
        )}

        {/* Última modificación */}
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Última modificación
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {new Date(doc.updatedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* ── Notas ───────────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Notas
        </p>
        {editing ? (
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            placeholder="Observaciones sobre este documento…"
          />
        ) : notas ? (
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{notas}</p>
        ) : (
          <p className="mt-2 text-sm italic text-gray-400">Sin notas</p>
        )}
      </div>

      {/* ── Acceso al archivo ────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Archivo
        </p>
        <a
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir documento
        </a>
        <p className="mt-2 text-xs text-gray-400 break-all">{doc.url}</p>
      </div>
    </div>
  );
}
