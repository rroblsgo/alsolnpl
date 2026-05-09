'use client';

import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { Controller, useFormContext } from 'react-hook-form';
import { TaskInput } from '../schemas/taskSchema';
import TaskRichTextEditor from './TaskRichTextEditor';
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TaskFormOptions,
} from '../types/task.types';

type Props = { options: TaskFormOptions };

function toDateInputValue(val: Date | string | null | undefined): string {
  if (!val) return '';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().substring(0, 10);
}

export default function TaskForm({ options }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TaskInput>();

  return (
    <div className="space-y-6">

      {/* Título */}
      <div>
        <FormLabel htmlFor="title">Título *</FormLabel>
        <FormInput id="title" type="text" placeholder="Título de la tarea" {...register('title')} />
        {errors.title && <FormError>{errors.title.message}</FormError>}
      </div>

      {/* Descripción */}
      <div>
        <FormLabel htmlFor="description">Descripción *</FormLabel>
        <textarea
          id="description"
          rows={3}
          maxLength={500}
          placeholder="Breve descripción de la tarea…"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          {...register('description')}
        />
        {errors.description && <FormError>{errors.description.message}</FormError>}
      </div>

      {/* Expediente */}
      <div>
        <FormLabel htmlFor="expediente">Expediente *</FormLabel>
        <FormInput id="expediente" type="text" placeholder="Ej. NPL-2026-001" {...register('expediente')} />
        {errors.expediente && <FormError>{errors.expediente.message}</FormError>}
      </div>

      {/* NPL vinculado */}
      <div>
        <FormLabel htmlFor="nplId">NPL vinculado (opcional)</FormLabel>
        <select
          id="nplId"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          {...register('nplId', { setValueAs: (v) => (v === '' || v === null) ? null : Number(v) })}
        >
          <option value="">— Sin NPL asociado —</option>
          {options.npls.map((n) => (
            <option key={n.id} value={n.id}>{n.tituloOperacion}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Comunidad */}
        <div>
          <FormLabel htmlFor="communityId">Comunidad *</FormLabel>
          <select
            id="communityId"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('communityId')}
          >
            <option value="">Selecciona una comunidad</option>
            {options.communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.communityId && <FormError>{errors.communityId.message}</FormError>}
        </div>

        {/* Asignado a */}
        <div>
          <FormLabel htmlFor="assigneeId">Asignar a *</FormLabel>
          <select
            id="assigneeId"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            {...register('assigneeId')}
          >
            <option value="">Selecciona un usuario</option>
            {options.users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
            ))}
          </select>
          {errors.assigneeId && <FormError>{errors.assigneeId.message}</FormError>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Estado */}
        <div>
          <FormLabel htmlFor="status">Estado</FormLabel>
          <select id="status" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('status')}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <FormLabel htmlFor="priority">Prioridad</FormLabel>
          <select id="priority" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('priority')}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <FormLabel htmlFor="category">Categoría</FormLabel>
          <select id="category" className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" {...register('category')}>
            {TASK_CATEGORIES.map((c) => (
              <option key={c} value={c}>{TASK_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fechas */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="fechaPropuesta">Fecha propuesta</FormLabel>
          <Controller
            control={control}
            name="fechaPropuesta"
            render={({ field }) => (
              <input
                id="fechaPropuesta"
                type="date"
                value={toDateInputValue(field.value as Date | string | null)}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            )}
          />
          {errors.fechaPropuesta && <FormError>{errors.fechaPropuesta.message}</FormError>}
        </div>

        <div>
          <FormLabel htmlFor="fechaLimite">Fecha límite</FormLabel>
          <Controller
            control={control}
            name="fechaLimite"
            render={({ field }) => (
              <input
                id="fechaLimite"
                type="date"
                value={toDateInputValue(field.value as Date | string | null)}
                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
              />
            )}
          />
          {errors.fechaLimite && <FormError>{errors.fechaLimite.message}</FormError>}
        </div>
      </div>

      {/* Notas — TipTap */}
      <div>
        <FormLabel>Notas (opcional)</FormLabel>
        <Controller
          control={control}
          name="notas"
          render={({ field }) => (
            <TaskRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.notas?.message}
            />
          )}
        />
      </div>

    </div>
  );
}
