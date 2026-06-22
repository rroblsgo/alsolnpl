'use client';

import { useState, useMemo } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { ExpedienteNotaListItem } from '../types/expediente.types';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';
import { DocumentListItem } from '@/src/fetatures/documents/types/document.types';
import ExpedienteNotaCard from './ExpedienteNotaCard';
import ExpedienteNotaForm from './ExpedienteNotaForm';
import ExpedienteNotaFilters, {
  ExpedienteFilters,
  EMPTY_FILTERS,
} from './ExpedienteNotaFilters';

type UserOption = { id: string; name: string; email: string };

type Props = {
  nplId: number;
  initialNotas: ExpedienteNotaListItem[];
  notaDocsMap: Record<number, DocumentListItem[]>;
  userOptions: UserOption[];
};

export default function NplFormSectionE({
  nplId,
  initialNotas,
  notaDocsMap,
  userOptions,
}: Props) {
  const [notas, setNotas]             = useState<ExpedienteNotaListItem[]>(initialNotas);
  const [docsMap, setDocsMap]         = useState<Record<number, DocumentListItem[]>>(notaDocsMap);
  const [showForm, setShowForm]       = useState(false);
  const [editingNota, setEditingNota] = useState<ExpedienteNotaListItem | null>(null);
  const [filters, setFilters]         = useState<ExpedienteFilters>(EMPTY_FILTERS);

  // ── Filtrado client-side ──────────────────────────────────────────────────

  const filteredNotas = useMemo(() => {
    return notas.filter((nota) => {
      const items = (nota.notaItems as NotaExpedienteItem[]) ?? [];

      if (filters.texto) {
        const q = filters.texto.toLowerCase();
        if (!items.some((it) => it.titulo.toLowerCase().includes(q))) return false;
      }
      if (filters.tipo       && nota.tipoNota       !== filters.tipo)       return false;
      if (filters.relevancia && nota.relevanciaNota !== filters.relevancia) return false;
      if (filters.status     && nota.statusNota     !== filters.status)     return false;
      if (filters.usuario    && nota.usuarioRelacionadoId !== filters.usuario) return false;

      if (filters.fechaDesde || filters.fechaHasta) {
        const firstFecha = items[0]?.fecha;
        if (!firstFecha) return false;
        if (filters.fechaDesde && firstFecha < filters.fechaDesde) return false;
        if (filters.fechaHasta && firstFecha > filters.fechaHasta) return false;
      }

      return true;
    });
  }, [notas, filters]);

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const handleSaved = (saved: ExpedienteNotaListItem) => {
    setNotas((prev) => {
      const idx = prev.findIndex((n) => n.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    // Inicializar entrada vacía en docsMap para nota nueva
    if (!docsMap[saved.id]) {
      setDocsMap((prev) => ({ ...prev, [saved.id]: [] }));
    }
    setShowForm(false);
    setEditingNota(null);
  };

  // Cuando el panel de documentos de una nota añade o elimina un doc,
  // actualizamos docsMap para que la card refleje el contador inmediatamente.
  const handleDocsChanged = (notaId: number, docs: DocumentListItem[]) => {
    setDocsMap((prev) => ({ ...prev, [notaId]: docs }));
  };

  const handleEdit = (nota: ExpedienteNotaListItem) => {
    setEditingNota(nota);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('expediente-form-anchor')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDeleted = (id: number) => {
    setNotas((prev) => prev.filter((n) => n.id !== id));
    setDocsMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-orange-500" />
          <h3 className="text-base font-semibold text-gray-900">E. Expediente NPL</h3>
          {notas.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {notas.length}
            </span>
          )}
        </div>
        {!showForm && (
          <button type="button"
            onClick={() => { setEditingNota(null); setShowForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600">
            <Plus className="h-3.5 w-3.5" /> Nueva nota
          </button>
        )}
      </div>

      {/* ── Formulario crear/editar ──────────────────────────────────────── */}
      {showForm && (
        <div id="expediente-form-anchor">
          <ExpedienteNotaForm
            nplId={nplId}
            nota={editingNota ?? undefined}
            initialDocuments={editingNota ? (docsMap[editingNota.id] ?? []) : []}
            userOptions={userOptions}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditingNota(null); }}
          />
        </div>
      )}

      {/* ── Filtros ──────────────────────────────────────────────────────── */}
      {notas.length > 0 && (
        <ExpedienteNotaFilters
          filters={filters}
          onChange={setFilters}
          userOptions={userOptions}
        />
      )}

      {/* ── Lista de notas ───────────────────────────────────────────────── */}
      {filteredNotas.length > 0 ? (
        <ul className="space-y-3">
          {filteredNotas.map((nota) => (
            <li key={nota.id}>
              <ExpedienteNotaCard
                nota={nota}
                notaDocs={docsMap[nota.id] ?? []}
                onEdit={handleEdit}
                onDeleted={handleDeleted}
                onDocsChanged={(docs) => handleDocsChanged(nota.id, docs)}
              />
            </li>
          ))}
        </ul>
      ) : notas.length > 0 ? (
        <p className="text-sm italic text-gray-400">
          No hay notas que coincidan con los filtros aplicados.
        </p>
      ) : (
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-5 text-center">
          <FolderOpen className="mx-auto mb-2 h-8 w-8 text-orange-300" />
          <p className="text-sm font-medium text-orange-800">Sin notas de expediente</p>
          <p className="mt-1 text-xs text-orange-600">
            Registra actuaciones comerciales, económicas, legales u otras vinculadas a este NPL.
          </p>
        </div>
      )}
    </div>
  );
}
