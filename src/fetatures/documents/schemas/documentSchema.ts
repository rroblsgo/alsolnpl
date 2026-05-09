import z from 'zod';
import { DOCUMENT_CATEGORIES, DOCUMENT_ENTITY_TYPES } from '../types/document.types';

export const DocumentSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(2, { error: 'El título es obligatorio (mín. 2 caracteres)' })
    .max(255, { error: 'El título no puede superar los 255 caracteres' }),

  url: z.string().url({ message: 'URL del documento no válida' }),

  nombreArchivo: z.string().optional(),
  extension: z.string().optional(),
  tamano: z.number().int().optional(),

  categoria: z.enum(DOCUMENT_CATEGORIES, {
    error: 'Selecciona una categoría válida',
  }),

  notas: z.string().trim().optional().or(z.literal('')),

  entityType: z.enum(DOCUMENT_ENTITY_TYPES, {
    error: 'Tipo de entidad no válido',
  }),
  entityId: z.number().int().positive({ message: 'ID de entidad no válido' }),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;
