'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, FileText, Eye, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ExpedienteNotaSchema,
  ExpedienteNotaInput,
  NotaItemFormInput,
} from '../schemas/expedienteSchema';
import {
  EXPEDIENTE_TIPOS_NOTA,
  EXPEDIENTE_RELEVANCIAS,
  EXPEDIENTE_STATUSES,
  EXPEDIENTE_TIPO_NOTA_LABELS,
  EXPEDIENTE_RELEVANCIA_LABELS,
  EXPEDIENTE_STATUS_LABELS,
  ExpedienteNotaListItem,
} from '../types/expediente.types';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';
import { DocumentListItem } from '@/src/fetatures/documents/types/document.types';
import { createExpedienteNotaAction, updateExpedienteNotaAction } from '../actions/expediente-actions';
import ExpedienteNotaItemForm from './ExpedienteNotaItemForm';
import ExpedienteContentModal from './ExpedienteContentModal';
import ExpedienteNotaDocumentsPanel from './ExpedienteNotaDocumentsPanel';

type UserOption = { id: string; name: string; email: string };

type Props = {
  nplId: number;
  /** Nota existente para edición (undefined = crear nueva) */
  nota?: ExpedienteNotaListItem;
  /** Documentos ya vinculados a la nota (solo en edición) */
  initialDocuments?: DocumentListItem[];
  userOptions: UserOption[];
  onSaved: (nota: ExpedienteNotaListItem) => void;
  onCancel: () => void;
};

export default function ExpedienteNotaForm({
  nplId,
  nota,
  initialDocuments = [],
  userOptions,
  onSaved,
  onCancel,
}: Props) {
  const isEditing = !!nota;
  const [isPending, startTransition] = useTransition();

  // Items del array nota_items gestionados localmente
  const [items, setItems] = useState<NotaExpedienteItem[]>(
    (nota?.notaItems as NotaExpedienteItem[]) ?? []
  );
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [viewingItem, setViewingItem] = useState<NotaExpedienteItem | null>(null);
  const [savedNotaId, setSavedNotaId] = useState<number | null>(nota?.id ?? null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Omit<ExpedienteNotaInput, 'notaItems'>>({
    resolver: zodResolver(ExpedienteNotaSchema.omit({ notaItems: true })),
    defaultValues: {
      tipoNota:             nota?.tipoNota        ?? 'otros',
      relevanciaNota:       nota?.relevanciaNota  ?? 'media',
      statusNota:           nota?.statusNota      ?? 'completar',
      usuarioRelacionadoId: nota?.usuarioRelacionadoId ?? '',
    },
  });

  // ── Gestión de items ────────────────────────────────────────────────────────

  const handleSaveItem = (itemData: NotaItemFormInput) => {
    const newItem: NotaExpedienteItem = {
      fecha:             itemData.fecha,
      titulo:            itemData.titulo,
      contenido:         itemData.contenido || undefined,
      documentos_upload: [],
    };
    if (editingItemIdx !== null) {
      setItems((prev) => prev.map((it, i) => i === editingItemIdx ? newItem : it));
    } else {
      setItems((prev) => [...prev, newItem]);
    }
    setShowItemForm(false);
    setEditingItemIdx(null);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit principal ────────────────────────────────────────────────────────

  const onSubmit = (metaData: Omit<ExpedienteNotaInput, 'notaItems'>) => {
    if (items.length === 0) {
      toast.error('Añade al menos una entrada a la nota');
      return;
    }
    const fullInput: ExpedienteNotaInput = {
      ...metaData,
      notaItems: items.map((it) => ({ ...it, documentos_upload: it.documentos_upload ?? [] })),
    };

    startTransition(async () => {
      if (isEditing && nota) {
        const { success, error } = await updateExpedienteNotaAction(nota.id, fullInput);
        if (error) { toast.error(error); return; }
        toast.success(success);
        onSaved({ ...nota, ...fullInput, notaItems: items });
      } else {
        const { success, error, nota: createdNota } = await createExpedienteNotaAction(nplId, fullInput);
        if (error) { toast.error(error); return; }
        toast.success(success);
        if (createdNota) {
          setSavedNotaId(createdNota.id);
          onSaved(createdNota);
        }
      }
    });
  };

  return (
    <div className="space-y-6 rounded-xl border border-orange-100 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-bold text-gray-800">
        {isEditing ? 'Editar nota del expediente' : 'Nueva nota del expediente'}
      </h4>

      {/* ── Metadatos ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tipo */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Tipo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register('tipoNota')}
              className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {EXPEDIENTE_TIPOS_NOTA.map((t) => (
                <option key={t} value={t}>{EXPEDIENTE_TIPO_NOTA_LABELS[t]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.tipoNota && <p className="mt-1 text-xs text-red-600">{errors.tipoNota.message}</p>}
        </div>

        {/* Relevancia */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Relevancia <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register('relevanciaNota')}
              className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {EXPEDIENTE_RELEVANCIAS.map((r) => (
                <option key={r} value={r}>{EXPEDIENTE_RELEVANCIA_LABELS[r]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Estado <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              {...register('statusNota')}
              className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {EXPEDIENTE_STATUSES.map((s) => (
                <option key={s} value={s}>{EXPEDIENTE_STATUS_LABELS[s]}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Usuario relacionado */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Usuario relacionado
          </label>
          <div className="relative">
            <select
              {...register('usuarioRelacionadoId')}
              className="w-full appearance-none rounded-md border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              <option value="">— Sin asignar —</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* ── Entradas (nota_items) ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Entradas de la nota
            {items.length === 0 && <span className="ml-1 text-red-500">*</span>}
          </label>
          {!showItemForm && (
            <button
              type="button"
              onClick={() => { setEditingItemIdx(null); setShowItemForm(true); }}
              className="flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100 border border-orange-200"
            >
              <Plus className="h-3.5 w-3.5" /> Añadir entrada
            </button>
          )}
        </div>

        {/* Lista de items existentes */}
        {items.length > 0 && (
          <ul className="mb-3 space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400">
                    {new Date(item.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.titulo}</p>
                  {item.contenido && (
                    <p className="mt-0.5 text-xs text-gray-400 italic">Con contenido</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {item.contenido && (
                    <button type="button" onClick={() => setViewingItem(item)} title="Ver contenido"
                      className="rounded-md p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button type="button" onClick={() => { setEditingItemIdx(idx); setShowItemForm(true); }} title="Editar"
                    className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleRemoveItem(idx)} title="Eliminar"
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulario de item (crear/editar) */}
        {showItemForm && (
          <ExpedienteNotaItemForm
            initial={editingItemIdx !== null ? items[editingItemIdx] : undefined}
            onSave={handleSaveItem}
            onCancel={() => { setShowItemForm(false); setEditingItemIdx(null); }}
          />
        )}

        {items.length === 0 && !showItemForm && (
          <p className="text-xs text-gray-400 italic">
            La nota necesita al menos una entrada. Pulsa «Añadir entrada».
          </p>
        )}
      </div>

      {/* ── Documentos (solo disponible tras guardar la nota) ─────────────── */}
      {savedNotaId && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Documentos adjuntos
          </p>
          <ExpedienteNotaDocumentsPanel
            notaId={savedNotaId}
            initialDocuments={initialDocuments}
          />
        </div>
      )}
      {!savedNotaId && (
        <p className="text-xs text-gray-400 italic">
          Los documentos se podrán adjuntar después de guardar la nota por primera vez.
        </p>
      )}

      {/* ── Botones submit ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 border-t pt-4">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit(onSubmit)}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear nota'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>

      {/* Modal de vista de contenido */}
      {viewingItem && (
        <ExpedienteContentModal item={viewingItem} onClose={() => setViewingItem(null)} />
      )}
    </div>
  );
}
