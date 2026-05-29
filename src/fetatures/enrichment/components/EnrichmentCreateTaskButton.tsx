'use client';

import { useState, useTransition, useEffect } from 'react';
import { ClipboardPlus, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FormInput, FormLabel } from '@/src/shared/components/forms';
import { createEnrichmentTaskAction } from '../actions/enrichment-task-actions';
import type { TaskCategory, TaskPriority } from '@/src/db/schema/task';

type UserOption = { id: string; name: string; email: string };

type Props = {
  enrichmentId:       number;
  operacionId:        number;
  expediente:         string;
  defaultTitle:       string;
  defaultDescription: string;
  defaultCategory:    TaskCategory;
  users:              UserOption[];   // lista de usuarios para asignar
  currentUserId:      string;         // usuario logado → assignee por defecto
};

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'DUE_DILIGENCE', label: 'Due diligence' },
  { value: 'LEGAL',         label: 'Legal' },
  { value: 'VALORACION',    label: 'Valoración' },
  { value: 'NEGOCIACION',   label: 'Negociación' },
  { value: 'CATASTRO',      label: 'Catastro' },
  { value: 'SUBASTA',       label: 'Subasta' },
  { value: 'ADMINISTRATIVO',label: 'Administrativo' },
  { value: 'OTRO',          label: 'Otro' },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'ALTA',  label: '🔴 Alta' },
  { value: 'MEDIA', label: '🟡 Media' },
  { value: 'BAJA',  label: '🟢 Baja' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function EnrichmentCreateTaskButton({
  enrichmentId,
  operacionId,
  expediente,
  defaultTitle,
  defaultDescription,
  defaultCategory,
  users,
  currentUserId,
}: Props) {
  const [open, setOpen]             = useState(false);
  const [title, setTitle]           = useState(defaultTitle);
  const [desc, setDesc]             = useState(defaultDescription);
  const [category, setCategory]     = useState<TaskCategory>(defaultCategory);
  const [priority, setPriority]     = useState<TaskPriority>('MEDIA');
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [fechaPropuesta, setFechaPropuesta] = useState(todayStr());
  const [fechaLimite, setFechaLimite]       = useState(tomorrowStr());
  const [isPending, startTransition]        = useTransition();

  // Cuando cambia fechaPropuesta, avanzar fechaLimite un día si está por detrás
  useEffect(() => {
    if (!fechaLimite || fechaLimite <= fechaPropuesta) {
      const d = new Date(fechaPropuesta);
      d.setDate(d.getDate() + 1);
      setFechaLimite(d.toISOString().slice(0, 10));
    }
  }, [fechaPropuesta]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOpen() {
    setTitle(defaultTitle);
    setDesc(defaultDescription);
    setCategory(defaultCategory);
    setPriority('MEDIA');
    setAssigneeId(currentUserId);
    setFechaPropuesta(todayStr());
    setFechaLimite(tomorrowStr());
    setOpen(true);
  }

  function handleCreate() {
    if (!title.trim()) { toast.error('El título es obligatorio'); return; }
    if (!assigneeId)   { toast.error('Selecciona un asignado'); return; }

    startTransition(async () => {
      const result = await createEnrichmentTaskAction({
        enrichmentId,
        operacionId,
        expediente,
        title:         title.trim(),
        description:   desc.trim(),
        category,
        priority,
        assigneeId,
        fechaPropuesta,
        fechaLimite,
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success(`Tarea creada #${result.taskId}`);
      setOpen(false);
    });
  }

  const selectCls = 'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm ' +
    'focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200
                   bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700
                   transition hover:bg-blue-100"
      >
        <ClipboardPlus size={13} />
        Crear tarea
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-900">Nueva tarea de acopio</h3>
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="space-y-4 px-5 py-4">
              {/* Expediente */}
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Expediente: <strong>{expediente}</strong>
              </div>

              {/* Título */}
              <div>
                <FormLabel htmlFor="task-title">
                  Título <span className="text-red-500">*</span>
                </FormLabel>
                <FormInput
                  id="task-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                />
              </div>

              {/* Descripción */}
              <div>
                <FormLabel htmlFor="task-desc">Descripción</FormLabel>
                <textarea
                  id="task-desc"
                  rows={3}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className={selectCls}
                  placeholder="Detalles de la tarea..."
                />
              </div>

              {/* Categoría + Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="task-cat">Categoría</FormLabel>
                  <select id="task-cat" value={category}
                    onChange={e => setCategory(e.target.value as TaskCategory)}
                    className={selectCls}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FormLabel htmlFor="task-prio">Prioridad</FormLabel>
                  <select id="task-prio" value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className={selectCls}>
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asignado */}
              <div>
                <FormLabel htmlFor="task-assignee">
                  Asignado a <span className="text-red-500">*</span>
                </FormLabel>
                <select id="task-assignee" value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className={selectCls}>
                  <option value="">— Selecciona usuario —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}{u.id === currentUserId ? ' (tú)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="task-fprop">Fecha propuesta</FormLabel>
                  <FormInput
                    id="task-fprop"
                    type="date"
                    value={fechaPropuesta}
                    onChange={e => setFechaPropuesta(e.target.value)}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="task-flim">Fecha límite</FormLabel>
                  <FormInput
                    id="task-flim"
                    type="date"
                    value={fechaLimite}
                    min={fechaPropuesta}
                    onChange={e => setFechaLimite(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button type="button" onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="button" onClick={handleCreate}
                disabled={isPending || !title.trim() || !assigneeId}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2
                           text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {isPending && <Loader2 size={14} className="animate-spin" />}
                {isPending ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
