import z from 'zod';
import { NPL_TIPOS_REGISTRO } from '@/src/fetatures/gestion_npl/types/npl.types';

export const DeudorSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, { error: 'El nombre es obligatorio' })
    .max(255, { error: 'El nombre no puede superar los 255 caracteres' }),
  dni: z.string().trim().max(20).optional().or(z.literal('')),
  esPrincipal: z.boolean().default(false),
  tipoRegistro: z.enum(NPL_TIPOS_REGISTRO).default('DEUDOR'),
  direccionCompleta: z.string().trim().optional().or(z.literal('')),
  estadoOcupacional: z.string().trim().optional().or(z.literal('')),
  vulnerabilidad: z.string().trim().optional().or(z.literal('')),
  notas: z.string().trim().optional().or(z.literal('')),
  otrosDatos: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, 'El título es obligatorio'),
        nombre: z.string().trim().min(1, 'El valor es obligatorio'),
      })
    )
    .default([]),
});

export type DeudorInput = z.input<typeof DeudorSchema>;
