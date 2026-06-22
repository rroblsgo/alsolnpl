'use client';

import { useState } from 'react';
import { Pencil, Trash2, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ExpedienteNotaListItem } from '../types/expediente.types';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';
import { DocumentListItem } from '@/src/fetatures/documents/types/document.types';
import { TipoNotaBadge, RelevanciaBadge, StatusNotaBadge } from './ExpedienteBadges';
import ExpedienteContentModal from './ExpedienteContentModal';
import ExpedienteNotaDocumentsPanel from './ExpedienteNotaDocumentsPanel';
import DeleteExpedienteNotaDialog from './DeleteExpedienteNotaDialog';

type Props = {
  nota: ExpedienteNotaListItem;
  notaDocs: DocumentListItem[];
  onEdit: (nota: ExpedienteNotaListItem) => void;
  onDeleted: (id: number) => void;
  onDocsChanged: (docs: DocumentListItem[]) => void;
};

export default function ExpedienteNotaCard({
  nota,
  notaDocs,
  onEdit,
  onDeleted,
  onDocsChanged,
}: Props) {
  const items = (nota.notaItems as NotaExpedienteItem[]) ?? [];
  const [expanded, setExpanded]       = useState(false);
  const [viewingItem, setViewingItem] = useState<NotaExpedienteItem | null>(null);
  const [showDocs, setShowDocs]       = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);

  const firstItem  = items[0];
  const notaTitulo = firstItem?.titulo ?? `Nota #${nota.id}`;

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <TipoNotaBadge tipo={nota.tipoNota} />
            <RelevanciaBadge relevancia={nota.relevanciaNota} />
            <StatusNotaBadge status={nota.statusNota} />
          </div>

          {firstItem ? (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                {new Date(firstItem.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">{firstItem.titulo}</p>
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">Sin entradas</p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            {nota.usuarioRelacionadoName && <span>👤 {nota.usuarioRelacionadoName}</span>}
            {nota.creatorName && <span>Creado por {nota.creatorName}</span>}
            <span>
              {new Date(nota.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
            {items.length > 1 && (
              <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                {items.length} entradas
              </span>
            )}
            {notaDocs.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                <FileText className="h-3 w-3" /> {notaDocs.length} doc{notaDocs.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => onEdit(nota)} title="Editar"
            className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteOpen(true)} title="Eliminar"
            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
          {items.length > 1 && (
            <button type="button" onClick={() => setExpanded((v) => !v)} title="Ver entradas"
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Acciones rápidas ──────────────────────────────────────────────── */}
      {firstItem && (
        <div className="flex gap-3 border-t border-gray-50 px-5 py-2">
          {firstItem.contenido && (
            <button type="button" onClick={() => setViewingItem(firstItem)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800">
              <Eye className="h-3.5 w-3.5" /> Ver contenido
            </button>
          )}
          <button type="button" onClick={() => setShowDocs((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
            <FileText className="h-3.5 w-3.5" />
            {showDocs ? 'Ocultar documentos' : `Documentos (${notaDocs.length})`}
          </button>
        </div>
      )}

      {/* ── Panel de documentos ───────────────────────────────────────────── */}
      {showDocs && (
        <div className="border-t border-gray-100 px-5 py-4">
          <ExpedienteNotaDocumentsPanel
            notaId={nota.id}
            initialDocuments={notaDocs}
            onDocsChanged={onDocsChanged}
          />
        </div>
      )}

      {/* ── Entradas adicionales expandidas ──────────────────────────────── */}
      {expanded && items.length > 1 && (
        <ul className="divide-y divide-gray-50 border-t border-gray-100">
          {items.slice(1).map((item, idx) => (
            <li key={idx} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">
                  {new Date(item.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
                <p className="text-sm font-medium text-gray-700 truncate">{item.titulo}</p>
              </div>
              {item.contenido && (
                <button type="button" onClick={() => setViewingItem(item)}
                  className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">
                  <Eye className="h-3.5 w-3.5" /> Ver
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {viewingItem && (
        <ExpedienteContentModal item={viewingItem} onClose={() => setViewingItem(null)} />
      )}

      <DeleteExpedienteNotaDialog
        notaId={nota.id}
        notaTitulo={notaTitulo}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={onDeleted}
      />
    </div>
  );
}
