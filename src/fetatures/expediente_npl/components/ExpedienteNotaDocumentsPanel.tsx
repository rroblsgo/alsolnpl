'use client';

import { useState, useTransition } from 'react';
import { UploadDropzone } from '@/shared/utils/uploadthing';
import { twMerge } from 'tailwind-merge';
import {
  FileText, Paperclip, Trash2, Pencil, Check, X,
  ChevronDown, Link as LinkIcon, Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createDocumentAction,
  deleteDocumentAction,
  updateDocumentAction,
} from '@/src/fetatures/documents/actions/document-actions';
import {
  DocumentCategory,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  DocumentListItem,
} from '@/src/fetatures/documents/types/document.types';

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

function isOneDriveUrl(url: string): boolean {
  return /sharepoint\.com|1drv\.ms|onedrive\.live\.com/i.test(url);
}

function FileIcon({ extension, url }: { extension: string; url?: string }) {
  if (url && isOneDriveUrl(url)) {
    return <LinkIcon className="h-4 w-4 shrink-0 text-blue-500" />;
  }
  const colorMap: Record<string, string> = {
    pdf: 'text-red-500', doc: 'text-blue-600', docx: 'text-blue-600',
    xls: 'text-green-600', xlsx: 'text-green-600',
    jpg: 'text-amber-500', jpeg: 'text-amber-500', png: 'text-amber-500',
  };
  return <FileText className={`h-4 w-4 shrink-0 ${colorMap[extension] ?? 'text-gray-400'}`} />;
}

// ─── Fila de documento guardado ───────────────────────────────────────────────

type DocRowProps = {
  doc: DocumentListItem;
  onDeleted: (id: number) => void;
  onUpdated: (id: number, titulo: string, categoria: DocumentCategory, notas: string) => void;
};

function DocRow({ doc, onDeleted, onUpdated }: DocRowProps) {
  const [editing, setEditing]     = useState(false);
  const [titulo, setTitulo]       = useState(doc.titulo);
  const [categoria, setCategoria] = useState<DocumentCategory>(doc.categoria);
  const [notas, setNotas]         = useState(doc.notas ?? '');
  const [isPending, startTransition] = useTransition();
  const ext = doc.extension ?? getExtension(doc.nombreArchivo ?? doc.url);
  const isOneDrive = isOneDriveUrl(doc.url);

  const handleSave = () => {
    startTransition(async () => {
      await updateDocumentAction(doc.id, { titulo, categoria, notas });
      onUpdated(doc.id, titulo, categoria, notas);
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el enlace "${doc.titulo}"?`)) return;
    startTransition(async () => {
      await deleteDocumentAction(doc.id);
      onDeleted(doc.id);
    });
  };

  if (editing) {
    return (
      <li className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          placeholder="Título del documento" />
        <div className="relative">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
            className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none">
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none"
          placeholder="Observaciones (opcional)" />
        <div className="flex gap-2">
          <button type="button" disabled={isPending || !titulo.trim()} onClick={handleSave}
            className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
            <Check className="h-3 w-3" /> Guardar
          </button>
          <button type="button"
            onClick={() => { setEditing(false); setTitulo(doc.titulo); setCategoria(doc.categoria); setNotas(doc.notas ?? ''); }}
            className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-white p-3">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <FileIcon extension={ext} url={doc.url} />
        <div className="min-w-0">
          <a href={doc.url} target="_blank" rel="noreferrer"
            className="truncate text-sm font-semibold text-orange-600 hover:underline" title={doc.titulo}>
            {doc.titulo}
          </a>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {isOneDrive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                <LinkIcon className="h-2.5 w-2.5" /> OneDrive
              </span>
            )}
            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {DOCUMENT_CATEGORY_LABELS[doc.categoria]}
            </span>
            {!isOneDrive && doc.nombreArchivo && (
              <span className="truncate max-w-[140px] text-xs text-gray-400">{doc.nombreArchivo}</span>
            )}
            {doc.tamano && <span className="text-xs text-gray-400">{formatFileSize(doc.tamano)}</span>}
          </div>
          {doc.notas && <p className="mt-0.5 text-xs italic text-gray-400">{doc.notas}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" onClick={() => setEditing(true)} title="Editar"
          className="rounded-md p-1 text-gray-400 hover:bg-orange-50 hover:text-orange-600">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={handleDelete} disabled={isPending} title="Eliminar"
          className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

// ─── Formulario confirmar upload ──────────────────────────────────────────────

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

function PendingDocForm({
  pending,
  onConfirm,
  onDiscard,
  isSaving,
  onChange,
}: {
  pending: PendingDoc;
  onConfirm: (data: Pick<PendingDoc, 'titulo' | 'categoria' | 'notas'>) => void;
  onDiscard: () => void;
  isSaving: boolean;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-3 space-y-2">
      <p className="text-xs font-medium text-orange-700 truncate">{pending.nombreArchivo}</p>
      <input type="text" value={pending.titulo} onChange={(e) => onChange('titulo', e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none"
        placeholder="Título del documento *" />
      <div className="relative">
        <select value={pending.categoria} onChange={(e) => onChange('categoria', e.target.value)}
          className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none">
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="flex gap-2">
        <button type="button" disabled={isSaving || !pending.titulo.trim()}
          onClick={() => onConfirm({ titulo: pending.titulo, categoria: pending.categoria, notas: pending.notas })}
          className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50">
          <Check className="h-3 w-3" /> Confirmar
        </button>
        <button type="button" onClick={onDiscard}
          className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
          <X className="h-3 w-3" /> Descartar
        </button>
      </div>
    </div>
  );
}

// ─── Formulario enlace OneDrive ───────────────────────────────────────────────

function OneDriveLinkForm({
  onAdd,
  isSaving,
}: {
  onAdd: (titulo: string, url: string, categoria: DocumentCategory) => void;
  isSaving: boolean;
}) {
  const [url, setUrl]           = useState('');
  const [titulo, setTitulo]     = useState('');
  const [categoria, setCategoria] = useState<DocumentCategory>('OTRO');
  const [urlError, setUrlError] = useState('');

  const handleAdd = () => {
    if (!url.trim()) { setUrlError('Pega la URL del documento'); return; }
    if (!url.startsWith('http')) { setUrlError('La URL no parece válida'); return; }
    if (!titulo.trim()) return;
    onAdd(titulo.trim(), url.trim(), categoria);
    setUrl('');
    setTitulo('');
    setCategoria('OTRO');
    setUrlError('');
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
      <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
        <LinkIcon className="h-3.5 w-3.5" />
        Pegar enlace de OneDrive / SharePoint
      </p>
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
        placeholder="https://alsol-my.sharepoint.com/..."
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {urlError && <p className="text-xs text-red-600">{urlError}</p>}
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título descriptivo del documento *"
        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <div className="relative">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as DocumentCategory)}
          className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-blue-400 focus:outline-none">
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>{DOCUMENT_CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      <button
        type="button"
        disabled={isSaving || !url.trim() || !titulo.trim()}
        onClick={handleAdd}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        <Check className="h-3 w-3" /> Añadir enlace
      </button>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

type Mode = 'upload' | 'onedrive';

type Props = {
  notaId: number;
  initialDocuments: DocumentListItem[];
  onDocsChanged?: (docs: DocumentListItem[]) => void;
};

export default function ExpedienteNotaDocumentsPanel({
  notaId,
  initialDocuments,
  onDocsChanged,
}: Props) {
  const [documents, setDocuments]     = useState<DocumentListItem[]>(initialDocuments);
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [mode, setMode]               = useState<Mode>('upload');
  const [isSaving, startTransition]   = useTransition();

  const updateDocs = (next: DocumentListItem[]) => {
    setDocuments(next);
    onDocsChanged?.(next);
  };

  // ── Upload ──────────────────────────────────────────────────────────────────

  const handleUploadComplete = (res: Array<{ ufsUrl: string; name: string; size: number }>) => {
    const newPending: PendingDoc[] = res.map((file) => ({
      tempId: `${Date.now()}-${Math.random()}`,
      titulo: file.name.replace(/\.[^.]+$/, ''),
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
        entityType: 'EXPEDIENTE_NOTA',
        entityId: notaId,
      });
      if (result.success && result.doc) {
        updateDocs([...documents, { ...result.doc!, uploaderName: null }]);
        setPendingDocs((prev) => prev.filter((p) => p.tempId !== tempId));
      }
    });
  };

  // ── OneDrive link ───────────────────────────────────────────────────────────

  const handleAddOneDriveLink = (titulo: string, url: string, categoria: DocumentCategory) => {
    startTransition(async () => {
      const result = await createDocumentAction({
        titulo,
        url,
        // undefined (no null) para campos opcionales — el schema Zod usa .optional()
        nombreArchivo: undefined,
        extension:     undefined,
        tamano:        undefined,
        categoria,
        notas:         undefined,
        entityType: 'EXPEDIENTE_NOTA',
        entityId: notaId,
      });
      if (result.error) {
        // Importar toast si no está ya importado arriba
        toast.error(result.error || 'Error al añadir el enlace');
        return;
      }
      if (result.success && result.doc) {
        updateDocs([...documents, { ...result.doc!, uploaderName: null }]);
      }
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* ── Selector de modo ─────────────────────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'upload'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="h-3.5 w-3.5" /> Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setMode('onedrive')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === 'onedrive'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" /> Enlace OneDrive
        </button>
      </div>

      {/* ── Upload ───────────────────────────────────────────────────────── */}
      {mode === 'upload' && (
        <>
          <UploadDropzone
            endpoint="expedienteNotaUploader"
            className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
            onClientUploadComplete={handleUploadComplete}
            appearance={{
              button: 'font-black py-2 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
              label: 'text-xs text-gray-500',
              allowedContent: 'text-xs',
            }}
            content={{
              button: 'Adjuntar documentos',
              label: 'PDF, Word, imágenes u otros archivos',
              allowedContent: 'Hasta 5 archivos de 16 MB',
            }}
            config={{ cn: twMerge, mode: 'auto' }}
          />
          {pendingDocs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Confirmar antes de guardar
              </p>
              {pendingDocs.map((pending) => (
                <PendingDocForm
                  key={pending.tempId}
                  pending={pending}
                  onConfirm={(updated) =>
                    handleConfirmPending(pending.tempId, { ...pending, ...updated })
                  }
                  onDiscard={() =>
                    setPendingDocs((prev) => prev.filter((p) => p.tempId !== pending.tempId))
                  }
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
        </>
      )}

      {/* ── Enlace OneDrive ───────────────────────────────────────────────── */}
      {mode === 'onedrive' && (
        <OneDriveLinkForm onAdd={handleAddOneDriveLink} isSaving={isSaving} />
      )}

      {/* ── Lista de documentos guardados ─────────────────────────────────── */}
      {documents.length > 0 ? (
        <ul className="space-y-1.5">
          {documents.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              onDeleted={(id) => updateDocs(documents.filter((d) => d.id !== id))}
              onUpdated={(id, titulo, categoria, notas) =>
                updateDocs(
                  documents.map((d) =>
                    d.id === id ? { ...d, titulo, categoria, notas: notas || null } : d
                  )
                )
              }
            />
          ))}
        </ul>
      ) : pendingDocs.length === 0 ? (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Paperclip className="h-3.5 w-3.5" /> Sin documentos adjuntos
        </p>
      ) : null}
    </div>
  );
}
