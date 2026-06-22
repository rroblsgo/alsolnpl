import z from 'zod';
import {
  EXPEDIENTE_TIPOS_NOTA,
  EXPEDIENTE_RELEVANCIAS,
  EXPEDIENTE_STATUSES,
} from '../types/expediente.types';

// ─── Schema de un item individual (para validación server-side y BD) ──────────

export const NotaExpedienteItemSchema = z.object({
  fecha: z
    .string()
    .min(1, { message: 'La fecha es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato de fecha inválido (YYYY-MM-DD)' }),

  titulo: z
    .string()
    .trim()
    .min(2, { message: 'El título es obligatorio (mín. 2 caracteres)' })
    .max(255, { message: 'El título no puede superar los 255 caracteres' }),

  contenido: z.string().optional().or(z.literal('')),

  documentos_upload: z.array(z.string().url()).default([]),
});

export type NotaExpedienteItemInput = z.infer<typeof NotaExpedienteItemSchema>;

// ─── Schema principal de la nota ─────────────────────────────────────────────

export const ExpedienteNotaSchema = z.object({
  tipoNota: z.enum(EXPEDIENTE_TIPOS_NOTA, {
    error: 'Selecciona un tipo de nota válido',
  }),

  relevanciaNota: z.enum(EXPEDIENTE_RELEVANCIAS, {
    error: 'Selecciona una relevancia válida',
  }),

  statusNota: z.enum(EXPEDIENTE_STATUSES, {
    error: 'Selecciona un estado válido',
  }),

  usuarioRelacionadoId: z
    .string()
    .optional()
    .nullable()
    .or(z.literal('')),

  notaItems: z
    .array(NotaExpedienteItemSchema)
    .min(1, { message: 'La nota debe tener al menos un item' }),
});

export type ExpedienteNotaInput = z.infer<typeof ExpedienteNotaSchema>;

// ─── Schema para el formulario de un item individual ─────────────────────────
// Nota: documentos_upload se declara independientemente para evitar la
// discordancia entre el tipo input (string[] | undefined) y output (string[])
// que produce .default([]) al reutilizar la shape en useForm<T>.

export const NotaItemFormSchema = z.object({
  fecha: z
    .string()
    .min(1, { message: 'La fecha es obligatoria' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Formato de fecha inválido (YYYY-MM-DD)' }),

  titulo: z
    .string()
    .trim()
    .min(2, { message: 'El título es obligatorio (mín. 2 caracteres)' })
    .max(255, { message: 'El título no puede superar los 255 caracteres' }),

  contenido: z.string().optional().or(z.literal('')),

  // Sin .default([]) aquí: el form gestiona el valor con defaultValues
  documentos_upload: z.array(z.string().url()).optional(),
});

// Tipo del formulario: documentos_upload es string[] | undefined (el form usa defaultValues)
export type NotaItemFormInput = z.infer<typeof NotaItemFormSchema>;
