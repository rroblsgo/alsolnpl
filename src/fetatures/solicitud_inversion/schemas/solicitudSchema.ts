import z from 'zod';
import {
  PROCEDENCIA_SOLICITUD_OPTIONS,
  TIPO_SOLICITUD_OPTIONS,
} from '../types/solicitud.types';

const procedenciaValues = PROCEDENCIA_SOLICITUD_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];
const tipoValues = TIPO_SOLICITUD_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const SolicitudInversionSchema = z.object({
  nplId: z.number().int().positive(),
  nplTitulo: z.string().trim().min(1),
  procedenciaSolicitud: z.enum(procedenciaValues as [string, ...string[]]),
  tipoSolicitud: z.enum(tipoValues as [string, ...string[]]),
  textoSolicitud: z
    .string()
    .trim()
    .min(10, { message: 'Escribe al menos 10 caracteres describiendo tu solicitud' })
    .max(1000, { message: 'Máximo 1000 caracteres' }),
});

export type SolicitudInversionInput = z.infer<typeof SolicitudInversionSchema>;
