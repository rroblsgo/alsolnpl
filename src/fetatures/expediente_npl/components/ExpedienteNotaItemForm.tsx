'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Check } from 'lucide-react';
import { NotaItemFormSchema, NotaItemFormInput } from '../schemas/expedienteSchema';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';
import ExpedienteRichTextEditor from './ExpedienteRichTextEditor';

type Props = {
  initial?: Partial<NotaExpedienteItem>;
  onSave: (item: NotaItemFormInput) => void;
  onCancel: () => void;
};

export default function ExpedienteNotaItemForm({ initial, onSave, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NotaItemFormInput>({
    resolver: zodResolver(NotaItemFormSchema),
    defaultValues: {
      fecha:             initial?.fecha    ?? today,
      titulo:            initial?.titulo   ?? '',
      contenido:         initial?.contenido ?? '',
      documentos_upload: initial?.documentos_upload ?? [],
    },
  });

  useEffect(() => {
    reset({
      fecha:             initial?.fecha    ?? today,
      titulo:            initial?.titulo   ?? '',
      contenido:         initial?.contenido ?? '',
      documentos_upload: initial?.documentos_upload ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Fecha */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('fecha')}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {errors.fecha && (
            <p className="mt-1 text-xs text-red-600">{errors.fecha.message}</p>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('titulo')}
            placeholder="Ej. Propuesta cliente, Reunión negociación…"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          {errors.titulo && (
            <p className="mt-1 text-xs text-red-600">{errors.titulo.message}</p>
          )}
        </div>
      </div>

      {/* Contenido TipTap */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Contenido <span className="text-gray-400">(opcional)</span>
        </label>
        <Controller
          name="contenido"
          control={control}
          render={({ field }) => (
            <ExpedienteRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.contenido?.message}
            />
          )}
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSubmit(onSave)}
          className="flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
        >
          <Check className="h-3.5 w-3.5" />
          {initial?.titulo ? 'Actualizar entrada' : 'Añadir entrada'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
        >
          <X className="h-3.5 w-3.5" /> Cancelar
        </button>
      </div>
    </div>
  );
}
