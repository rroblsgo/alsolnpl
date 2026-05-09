import {
  npl,
  nplDeudores,
  nplEstadoEnum,
  nplTipoInmuebleEnum,
  nplProcedimientoEnum,
  nplTipoRegistroEnum,
} from '@/src/db/schema';

export type InsertNpl = typeof npl.$inferInsert;
export type SelectNpl = typeof npl.$inferSelect;

// Los tipos de deudores ahora viven en src/fetatures/npl_deudores/types/deudor.types.ts
// Se re-exportan aquí para no romper imports existentes
export type InsertNplDeudor = typeof nplDeudores.$inferInsert;
export type SelectNplDeudor = typeof nplDeudores.$inferSelect;

export type NplEstado = (typeof nplEstadoEnum.enumValues)[number];
export type NplTipoInmueble = (typeof nplTipoInmuebleEnum.enumValues)[number];
export type NplProcedimiento = (typeof nplProcedimientoEnum.enumValues)[number];
export type NplTipoRegistro = (typeof nplTipoRegistroEnum.enumValues)[number];

export const NPL_ESTADOS = [...nplEstadoEnum.enumValues] as const;
export const NPL_TIPOS_INMUEBLE = [...nplTipoInmuebleEnum.enumValues] as const;
export const NPL_PROCEDIMIENTOS = [...nplProcedimientoEnum.enumValues] as const;
export const NPL_TIPOS_REGISTRO = [...nplTipoRegistroEnum.enumValues] as const;

export const NPL_ESTADO_LABELS: Record<NplEstado, string> = {
  ACTIVO: 'Activo',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  ARCHIVADO: 'Archivado',
};

export const NPL_TIPO_INMUEBLE_LABELS: Record<NplTipoInmueble, string> = {
  VIVIENDA: 'Vivienda',
  LOCAL: 'Local',
  OFICINA: 'Oficina',
  GARAJE: 'Garaje',
  TRASTERO: 'Trastero',
  NAVE_INDUSTRIAL: 'Nave industrial',
  SOLAR: 'Solar',
  FINCA_RUSTICA: 'Finca rústica',
  OTRO: 'Otro',
};

export const NPL_PROCEDIMIENTO_LABELS: Record<NplProcedimiento, string> = {
  EJH: 'Ejecución hipotecaria',
  ETNJ: 'Ejecución de títulos no judiciales',
  ETJ: 'Ejecución de títulos judiciales',
  PO: 'Procedimiento ordinario',
  DESAHUCIO: 'Desahucio',
  OTRO: 'Otros',
};

export const NPL_TIPO_REGISTRO_LABELS: Record<NplTipoRegistro, string> = {
  DEUDOR: 'Deudor',
  HIPOTECANTE: 'Hipotecante',
  FIADOR: 'Fiador',
};

// Tipo enriquecido para listados (sin campos deudor_* — eliminados del schema)
export type NplListItem = SelectNpl & {
  creatorName: string;
};

// Tipo para cálculo de rentabilidad derivada
export type NplRentabilidad = {
  inversionTotal: number | null;
  beneficioNeto: number | null;
  roiNeto: number | null;
  escenarios: import('../utils/npl-calc').Escenario[];
};
