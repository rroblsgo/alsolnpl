'use client';

import { useState, useTransition } from 'react';
import { UploadDropzone } from '@/shared/utils/uploadthing';
import { twMerge } from 'tailwind-merge';
import {
  FileText,
  Paperclip,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
} from '../actions/document-actions';
import {
  DocumentCategory,
  DocumentEntityType,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentListItem,
} from '../types/document.types';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ extension }: { extension: string }) {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-500',
    doc: 'text-blue-600',
    docx: 'text-blue-600',
    xls: 'text-green-600',
    xlsx: 'text-green-600',
    jpg: 'text-amber-500',
    jpeg: 'text-amber-500',
    png: 'text-amber-500',
  };
  return (
    <FileText
      className={`h-4 w-4 shrink-0 ${colorMap[extension] ?? 'text-gray-400'}`}
    />
  );
}

// ─── Sub-componente: fila de documento ───────────────────────────────────────

type DocumentRowProps = {
  doc: DocumentListItem;
  onDeleted: (id: number) => void;
  onUpdated: (id: number, titulo: string, categoria: DocumentCategory, notas: string) => void;
};

function DocumentRow({ doc, onDeleted, onUpdated }: DocumentRowProps) {
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(doc.titulo);
  const [categoria, setCategoria] = useState<DocumentCategory>(doc.categoria);
  const [notas, setNotas] = useState(doc.notas ?? '');
  const [isPending, startTransition] = useTransition();

  const ext = doc.extension ?? getExtension(doc.nombreArchivo ?? doc.url);

  const handleSave = () => {
    startTransition(async () => {
      await updateDocumentAction(doc.id, { titulo, categoria, notas });
      onUpdated(doc.id, titulo, categoria, notas);
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el documento "${doc.titulo}"?`)) return;
    startTransition(async () => {
      await deleteDocumentAction(doc.id);
      onDeleted(doc.id);
    });
  };

  return (
    <li className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      {editing ? (
        <div className="space-y-3">
          {/* Título */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Categoría
            </label>
            <div className="relative">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
                className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {DOCUMENT_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              placeholder="Observaciones sobre este documento…"
            />
          </div>

          {/* Acciones edición */}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending || !titulo.trim()}
              onClick={handleSave}
              className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <Check className="h-3 w-3" /> Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setTitulo(doc.titulo);
                setCategoria(doc.categoria);
                setNotas(doc.notas ?? '');
              }}
              className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <X className="h-3 w-3" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          {/* Info */}
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <FileIcon extension={ext} />
            <div className="min-w-0">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-semibold text-orange-600 hover:underline"
                title={doc.titulo}
              >
                {doc.titulo}
              </a>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {DOCUMENT_CATEGORY_LABELS[doc.categoria]}
                </span>
                {doc.nombreArchivo && (
                  <span className="text-xs text-gray-400 truncate max-w-[180px]" title={doc.nombreArchivo}>
                    {doc.nombreArchivo}
                  </span>
                )}
                {doc.tamano && (
                  <span className="text-xs text-gray-400">
                    {formatFileSize(doc.tamano)}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(doc.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {doc.uploaderName && (
                  <span className="text-xs text-gray-400">
                    por {doc.uploaderName}
                  </span>
                )}
              </div>
              {doc.notas && (
                <p className="mt-1 text-xs italic text-gray-500">{doc.notas}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Editar"
              className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              title="Eliminar"
              className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ─── Props del panel principal ────────────────────────────────────────────────

type PendingDoc = {
  tempId: string;
  titulo: string;
  categoria: DocumentCategory;
  notas: string;
  url: string;
  nombreArchivo: string;
  extension: string;
  tamano: number;
};

type Props = {
  entityType: DocumentEntityType;
  entityId: number;
  initialDocuments: DocumentListItem[];
  uploadEndpoint: keyof OurFileRouter;
  uploaderLabel?: string;
  uploaderAllowedContent?: string;
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DocumentsPanel({
  entityType,
  entityId,
  initialDocuments,
  uploadEndpoint,
  uploaderLabel = 'PDF, Word, Excel u otros archivos',
  uploaderAllowedContent = 'Hasta 10 archivos de 16 MB cada uno',
}: Props) {
  const [documents, setDocuments] = useState<DocumentListItem[]>(initialDocuments);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [isSaving, startTransition] = useTransition();

  // Cuando UploadThing completa la subida, pedimos título+categoría antes de guardar
  const handleUploadComplete = (
    res: Array<{
      ufsUrl: string;
      name: string;
      size: number;
    }>
  ) => {
    const newPending: PendingDoc[] = res.map((file) => ({
      tempId: `${Date.now()}-${Math.random()}`,
      titulo: file.name.replace(/\.[^.]+$/, ''), // nombre sin extensión como título por defecto
      categoria: 'OTRO' as DocumentCategory,
      notas: '',
      url: file.ufsUrl,
      nombreArchivo: file.name,
      extension: getExtension(file.name),
      tamano: file.size,
    }));
    setPendingDocs((prev) => [...prev, ...newPending]);
  };

  const handleConfirmPending = (tempId: string, pending: PendingDoc) => {
    startTransition(async () => {
      const result = await createDocumentAction({
        titulo: pending.titulo,
        url: pending.url,
        nombreArchivo: pending.nombreArchivo,
        extension: pending.extension,
        tamano: pending.tamano,
        categoria: pending.categoria,
        notas: pending.notas,
        entityType,
        entityId,
      });

      if (result.success && result.doc) {
        // Use the real document returned from the server (with correct integer id)
        const savedDoc: DocumentListItem = {
          ...result.doc,
          uploaderName: null,
        };
        setDocuments((prev) => [...prev, savedDoc]);
        setPendingDocs((prev) => prev.filter((p) => p.tempId !== tempId));
      }
    });
  };

  const handleDiscardPending = (tempId: string) => {
    setPendingDocs((prev) => prev.filter((p) => p.tempId !== tempId));
  };

  const handleDocDeleted = (id: number) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDocUpdated = (
    id: number,
    titulo: string,
    categoria: DocumentCategory,
    notas: string
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, titulo, categoria, notas: notas || null } : d
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Uploader */}
      <UploadDropzone
        endpoint={uploadEndpoint}
        className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
        onClientUploadComplete={handleUploadComplete}
        appearance={{
          button:
            'font-black py-3 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
          label: 'text-sm text-gray-500 hover:text-gray-800',
          allowedContent: 'text-sm',
        }}
        content={{
          button: 'Adjuntar documentos',
          label: uploaderLabel,
          allowedContent: uploaderAllowedContent,
        }}
        config={{ cn: twMerge, mode: 'auto' }}
      />

      {/* Documentos pendientes de confirmar */}
      {pendingDocs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
            Completar datos antes de guardar
          </p>
          {pendingDocs.map((pending) => (
            <PendingDocForm
              key={pending.tempId}
              pending={pending}
              onConfirm={(updated) =>
                handleConfirmPending(pending.tempId, { ...pending, ...updated })
              }
              onDiscard={() => handleDiscardPending(pending.tempId)}
              isSaving={isSaving}
              onChange={(field, value) =>
                setPendingDocs((prev) =>
                  prev.map((p) =>
                    p.tempId === pending.tempId ? { ...p, [field]: value } : p
                  )
                )
              }
            />
          ))}
        </div>
      )}

      {/* Lista de documentos guardados */}
      {documents.length > 0 ? (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              onDeleted={handleDocDeleted}
              onUpdated={handleDocUpdated}
            />
          ))}
        </ul>
      ) : pendingDocs.length === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <Paperclip className="h-3.5 w-3.5" />
          Sin documentos adjuntos
        </p>
      ) : null}
    </div>
  );
}

// ─── Formulario para confirmar un documento recién subido ─────────────────────

type PendingDocFormProps = {
  pending: PendingDoc;
  onConfirm: (data: Pick<PendingDoc, 'titulo' | 'categoria' | 'notas'>) => void;
  onDiscard: () => void;
  isSaving: boolean;
  onChange: (field: string, value: string) => void;
};

function PendingDocForm({
  pending,
  onConfirm,
  onDiscard,
  isSaving,
  onChange,
}: PendingDocFormProps) {
  const ext = pending.extension;
  return (
    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
        <FileIcon extension={ext} />
        <span className="truncate text-xs text-gray-500">{pending.nombreArchivo}</span>
      </div>

      {/* Título */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={pending.titulo}
          onChange={(e) => onChange('titulo', e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          placeholder="Ej. Nota simple registral, Tasación pericial…"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Categoría
        </label>
        <div className="relative">
          <select
            value={pending.categoria}
            onChange={(e) => onChange('categoria', e.target.value)}
            className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {DOCUMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Notas (opcional)
        </label>
        <textarea
          value={pending.notas}
          onChange={(e) => onChange('notas', e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          placeholder="Observaciones…"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isSaving || !pending.titulo.trim()}
          onClick={() =>
            onConfirm({
              titulo: pending.titulo,
              categoria: pending.categoria,
              notas: pending.notas,
            })
          }
          className="flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> Confirmar
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <X className="h-3.5 w-3.5" /> Descartar
        </button>
      </div>
    </div>
  );
}
