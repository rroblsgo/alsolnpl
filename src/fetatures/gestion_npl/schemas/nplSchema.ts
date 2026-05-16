import z from 'zod';
import {
  NPL_ESTADOS,
  NPL_TIPOS_INMUEBLE,
  NPL_PROCEDIMIENTOS,
} from '../types/npl.types';

// ─── Sección A: Superficies y datos registrales ───────────────────────────────

const NplSectionASchema = z.object({
  // nuestroCodigoNpl se genera automáticamente al crear; en edición es display only
  nuestroCodigoNpl: z.string().trim().max(10).optional().or(z.literal('')),
  tituloOperacion: z
    .string()
    .trim()
    .min(3, { error: 'El título de la operación es obligatorio' })
    .max(255, { error: 'El título no puede superar los 255 caracteres' }),
  referenciaOrigen: z.string().trim().max(100).optional().or(z.literal('')),
  fondo: z.string().trim().max(100).optional().or(z.literal('')),
  direccion: z.string().trim().max(255).optional().or(z.literal('')),
  municipio: z.string().trim().max(100).optional().or(z.literal('')),
  provincia: z.string().trim().max(100).optional().or(z.literal('')),
  codigoPostal: z.string().trim().max(10).optional().or(z.literal('')),
  tipoInmueble: z.enum(NPL_TIPOS_INMUEBLE, {
    error: 'Selecciona un tipo de inmueble válido',
  }),
  distribucion: z.string().trim().optional().or(z.literal('')),
  distribucionResumida: z.string().trim().max(255).optional().or(z.literal('')),
  superficieConst: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  superficieParcela: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  superficieDetalles: z.string().trim().optional().or(z.literal('')),
  anyConstruccion: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{4}$/.test(v), {
      message: 'Introduce un año válido (4 dígitos)',
    }),
  refCatastral: z.string().trim().max(50).optional().or(z.literal('')),
  latCatastro: z.string().optional().or(z.literal('')),
  lngCatastro: z.string().optional().or(z.literal('')),
  fincaRegistral: z.string().trim().max(100).optional().or(z.literal('')),
  datosRegistro: z.string().trim().optional().or(z.literal('')),
  imagenAsociada: z.string().trim().max(255).optional().or(z.literal('')),
  imagenesAdicionales: z.array(z.string()).default([]),
});

// ─── Sección B: Rentabilidad ──────────────────────────────────────────────────
// principal, intereses, costas se editan en sección C → aquí no están

const NplSectionBSchema = z.object({
  costeAdquisicionCredito: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  impuestosAjd: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  costesNotariaRegistro: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  gastosDacion: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  precioMercado: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  precioVentaRapida: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  comisionIntermediacion: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  pujaProbable: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  fechaCompra: z.string().optional().or(z.literal('')),
  fechaTerminacion: z.string().optional().or(z.literal('')),
  gastosDiversos: z
    .array(
      z.object({
        titulo: z.string().trim().min(1, 'El título es obligatorio'),
        valor: z.number({ error: 'Introduce un número válido' }),
      })
    )
    .default([]),
  informacionInversor: z.string().trim().optional().or(z.literal('')),
});

// ─── Sección C: Estado real y procesal ───────────────────────────────────────

const NplSectionCSchema = z.object({
  // Deuda: principal + intereses + costas (los tres son editables en sección C)
  principal: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  intereses: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  costas: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  fechaCalculada: z.string().optional().or(z.literal('')),
  tasacionSubasta: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(parseFloat(v)), {
      message: 'Introduce un número válido',
    }),
  procedimiento: z.enum(NPL_PROCEDIMIENTOS).optional(),
  numProcedimiento: z.string().trim().max(50).optional().or(z.literal('')),
  juzgado: z.string().trim().max(255).optional().or(z.literal('')),
  ejecutante: z.string().trim().max(255).optional().or(z.literal('')),
  autoDespachoEjecucion: z.string().trim().optional().or(z.literal('')),
  prestamoHipotecaDetalles: z.string().trim().optional().or(z.literal('')),
  actuacionesJudiciales: z
    .array(
      z.object({
        fecha: z.string().min(1, 'La fecha es obligatoria'),
        titulo: z.string().trim().min(1, 'El título es obligatorio'),
      })
    )
    .default([]),
  actuacionesSeguidas: z.string().trim().optional().or(z.literal('')),
  riesgosJuridicos: z.string().trim().optional().or(z.literal('')),
  notasInternas: z.string().trim().optional().or(z.literal('')),
});

// ─── Control ──────────────────────────────────────────────────────────────────

const NplControlSchema = z.object({
  estado: z.enum(NPL_ESTADOS, { error: 'Estado no válido' }),
  esPublico: z.boolean().default(false),
});

// ─── Schema completo ──────────────────────────────────────────────────────────

export const NplSchema = NplSectionASchema.merge(NplSectionBSchema)
  .merge(NplSectionCSchema)
  .merge(NplControlSchema);

export type NplInput = z.input<typeof NplSchema>;

export const UpdateNplEstadoSchema = z.object({
  estado: z.enum(NPL_ESTADOS, { error: 'Estado no válido' }),
});

export type UpdateNplEstadoInput = z.infer<typeof UpdateNplEstadoSchema>;
