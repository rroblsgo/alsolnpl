import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const nplEstadoEnum = pgEnum('npl_estado', [
  'ACTIVO',
  'RESERVADO',
  'VENDIDO',
  'ARCHIVADO',
]);

export const nplTipoInmuebleEnum = pgEnum('npl_tipo_inmueble', [
  'VIVIENDA',
  'LOCAL',
  'OFICINA',
  'GARAJE',
  'TRASTERO',
  'NAVE_INDUSTRIAL',
  'SOLAR',
  'FINCA_RUSTICA',
  'OTRO',
]);

export const nplProcedimientoEnum = pgEnum('npl_procedimiento', [
  'EJH',
  'ETNJ',
  'ETJ',
  'PO',
  'DESAHUCIO',
  'OTRO',
]);

// Enum para tipo de registro en npl_deudores
export const nplTipoRegistroEnum = pgEnum('npl_tipo_registro', [
  'DEUDOR',
  'HIPOTECANTE',
  'FIADOR',
]);

// ─── Tabla principal NPL ──────────────────────────────────────────────────────

export const npl = pgTable('npls', {
  id: serial('id').primaryKey(),

  // A. Superficies y datos registrales
  nuestroCodigoNpl: varchar('nuestro_codigo_npl', { length: 10 }),
  tituloOperacion: varchar('titulo_operacion', { length: 255 }).notNull(),
  referenciaOrigen: varchar('referencia_origen', { length: 100 }),
  fondo: varchar('fondo', { length: 100 }),
  direccion: varchar('direccion', { length: 255 }),
  municipio: varchar('municipio', { length: 100 }),
  provincia: varchar('provincia', { length: 100 }),
  codigoPostal: varchar('codigo_postal', { length: 10 }),
  tipoInmueble: nplTipoInmuebleEnum('tipo_inmueble')
    .notNull()
    .default('VIVIENDA'),
  distribucion: text('distribucion'),
  distribucionResumida: varchar('distribucion_resumida', { length: 255 }),
  superficieConst: numeric('superficie_const', { precision: 10, scale: 2 }),
  superficieParcela: numeric('superficie_parcela', { precision: 10, scale: 2 }),
  superficieDetalles: text('superficie_detalles'),
  anyConstruccion: integer('any_construccion'),
  refCatastral: varchar('ref_catastral', { length: 50 }),
  fincaRegistral: varchar('finca_registral', { length: 100 }),
  datosRegistro: text('datos_registro'),
  imagenAsociada: varchar('imagen_asociada', { length: 255 }),
  imagenesAdicionales: text('imagenes_adicionales')
    .array()
    .notNull()
    .default([]),

  // B. Rentabilidad
  costeAdquisicionCredito: numeric('coste_adquisicion_credito', {
    precision: 14,
    scale: 2,
  }),
  impuestosAjd: numeric('impuestos_ajd', { precision: 14, scale: 2 }),
  costesNotariaRegistro: numeric('costes_notaria_registro', {
    precision: 14,
    scale: 2,
  }),
  gastosDacion: numeric('gastos_dacion', { precision: 14, scale: 2 }),
  precioMercado: numeric('precio_mercado', { precision: 14, scale: 2 }),
  precioVentaRapida: numeric('precio_venta_rapida', {
    precision: 14,
    scale: 2,
  }),
  comisionIntermediacion: numeric('comision_intermediacion', {
    precision: 14,
    scale: 2,
  }),
  pujaProbable: numeric('puja_probable', { precision: 14, scale: 2 }),
  fechaCompra: date('fecha_compra'),
  fechaTerminacion: date('fecha_terminacion'),
  gastosDiversos: jsonb('gastos_diversos')
    .$type<{ titulo: string; valor: number }[]>()
    .notNull()
    .default([]),

  // C. Estado real y procesal
  // principal, intereses, costas vienen de sección B original → ahora en C
  principal: numeric('principal', { precision: 14, scale: 2 }),
  intereses: numeric('intereses', { precision: 14, scale: 2 }),
  costas: numeric('costas', { precision: 14, scale: 2 }),
  // deuda_actualizada es calculado (principal + intereses + costas), NO se almacena
  fechaCalculada: date('fecha_calculada'),
  tasacionSubasta: numeric('tasacion_subasta', { precision: 14, scale: 2 }),
  procedimiento: nplProcedimientoEnum('procedimiento').default('EJH'),
  numProcedimiento: varchar('num_procedimiento', { length: 50 }),
  juzgado: varchar('juzgado', { length: 255 }),
  ejecutante: varchar('ejecutante', { length: 255 }),
  autoDespachoEjecucion: text('auto_despacho_ejecucion'),
  prestamoHipotecaDetalles: text('prestamo_hipoteca_detalles'),
  actuacionesJudiciales: jsonb('actuaciones_judiciales')
    .$type<{ fecha: string; titulo: string }[]>()
    .notNull()
    .default([]),
  actuacionesSeguidas: text('actuaciones_seguidas'),
  riesgosJuridicos: text('riesgos_juridicos'),
  notasInternas: text('notas_internas'),
  informacionInversor: text('informacion_inversor'),

  // Control interno
  estado: nplEstadoEnum('estado').notNull().default('ACTIVO'),
  esPublico: boolean('es_publico').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// ─── Tabla de deudores ────────────────────────────────────────────────────────

export const nplDeudores = pgTable('npl_deudores', {
  id: serial('id').primaryKey(),
  nplId: integer('npl_id')
    .notNull()
    .references(() => npl.id, { onDelete: 'cascade' }),
  esPrincipal: boolean('es_principal').notNull().default(false),
  tipoRegistro: nplTipoRegistroEnum('tipo_registro').notNull().default('DEUDOR'),
  nombre: varchar('nombre', { length: 255 }).notNull(),
  dni: varchar('dni', { length: 20 }),
  direccionCompleta: text('direccion_completa'),
  estadoOcupacional: text('estado_ocupacional'),
  vulnerabilidad: text('vulnerabilidad'),
  notas: text('notas'),
  otrosDatos: jsonb('otros_datos')
    .$type<{ titulo: string; nombre: string }[]>()
    .notNull()
    .default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type NplEstado = (typeof nplEstadoEnum.enumValues)[number];
export type NplTipoInmueble = (typeof nplTipoInmuebleEnum.enumValues)[number];
export type NplProcedimiento = (typeof nplProcedimientoEnum.enumValues)[number];
export type NplTipoRegistro = (typeof nplTipoRegistroEnum.enumValues)[number];
