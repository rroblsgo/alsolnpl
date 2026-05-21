import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  boolean,
  date,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { fondos }   from './fondos';
import { carteras } from './fondos';

// ─── Enum status_tratamiento ──────────────────────────────────────────────────
export const operacionStatusEnum = pgEnum('operacion_status', [
  'nuevo',
  'analisis',
  'scoring',
  'seleccionado',
  'descartado',
  'comercializado',
  'ofertado',
  'reservado',
  'vendido',
  'cancelado',
]);

export const STATUS_LABELS: Record<string, string> = {
  nuevo:           'Nuevo',
  analisis:        'Análisis',
  scoring:         'Scoring',
  seleccionado:    'Seleccionado',
  descartado:      'Descartado',
  comercializado:  'Comercializado',
  ofertado:        'Ofertado',
  reservado:       'Reservado',
  vendido:         'Vendido',
  cancelado:       'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  nuevo:           'bg-gray-100 text-gray-700',
  analisis:        'bg-blue-100 text-blue-700',
  scoring:         'bg-purple-100 text-purple-700',
  seleccionado:    'bg-emerald-100 text-emerald-700',
  descartado:      'bg-red-100 text-red-600',
  comercializado:  'bg-amber-100 text-amber-700',
  ofertado:        'bg-orange-100 text-orange-700',
  reservado:       'bg-yellow-100 text-yellow-700',
  vendido:         'bg-green-100 text-green-800',
  cancelado:       'bg-slate-100 text-slate-500',
};

// ─── Tabla operaciones ────────────────────────────────────────────────────────
export const operaciones = pgTable('operaciones', {
  id: serial('id').primaryKey(),

  fondoId:   integer('fondo_id').references(() => fondos.id,    { onDelete: 'set null' }),
  carteraId: integer('cartera_id').references(() => carteras.id, { onDelete: 'set null' }),

  assetManager:       varchar('asset_manager',        { length: 100 }),
  oficinaResponsable: varchar('oficina_responsable',  { length: 100 }),
  expedienteId:       varchar('expediente_id',        { length: 50  }),
  prestamoId:         varchar('prestamo_id',          { length: 50  }),
  nplReo:             varchar('npl_reo',              { length: 20  }),
  deudorNombre:       varchar('deudor_nombre',        { length: 100 }),
  fechaAlta:          date('fecha_alta'),

  deuda:                numeric('deuda',                    { precision: 14, scale: 2 }),
  precioVentaMercado:   numeric('precio_venta_mercado',     { precision: 14, scale: 2 }),
  rangoLienPrestamo:    varchar('rango_lien_prestamo',      { length: 10  }),
  valorTasacionSubasta: numeric('valor_tasacion_subasta',   { precision: 14, scale: 2 }),

  propertyId:            varchar('property_id',             { length: 50  }),
  propertyTipo:          varchar('property_tipo',           { length: 100 }),
  propertyTipoOcupacion: varchar('property_tipo_ocupacion', { length: 100 }),
  esVpo:                 boolean('es_vpo'),
  esVulnerable:          varchar('es_vulnerable',           { length: 100 }),

  provincia:         varchar('provincia',          { length: 50  }),
  municipio:         varchar('municipio',          { length: 50  }),
  codPostal:         varchar('cod_postal',         { length: 10  }),
  direccionCompleta: varchar('direccion_completa', { length: 255 }),

  referenciaCatastral: varchar('referencia_catastral', { length: 25  }),
  idufir:              varchar('idufir',               { length: 50  }),
  parcel:              varchar('parcel',               { length: 20  }),
  superficieConst:     numeric('superficie_const',     { precision: 10, scale: 2 }),
  superficieUtil:      numeric('superficie_util',      { precision: 10, scale: 2 }),
  superficieFinca:     numeric('superficie_finca',     { precision: 10, scale: 2 }),
  superficieRegistral: numeric('superficie_registral', { precision: 10, scale: 2 }),
  libro:  varchar('libro',  { length: 50 }),
  tomo:   varchar('tomo',   { length: 50 }),
  finca:  varchar('finca',  { length: 50 }),
  folio:  varchar('folio',  { length: 50 }),
  latitud:  numeric('latitud',  { precision: 12, scale: 8 }),
  longitud: numeric('longitud', { precision: 12, scale: 8 }),
  anyConstruccion: integer('any_construccion'),

  procLegal:       varchar('proc_legal',        { length: 50  }),
  procLegalTipo:   varchar('proc_legal_tipo',   { length: 50  }),
  procLegalFase:   varchar('proc_legal_fase',   { length: 50  }),
  procLegalNumero: varchar('proc_legal_numero', { length: 50  }),
  procLegalCourt:  varchar('proc_legal_court',  { length: 100 }),
  procLegalEstado: varchar('proc_legal_estado', { length: 50  }),

  registroProvincia: varchar('registro_provincia', { length: 50 }),
  registroCiudad:    varchar('registro_ciudad',    { length: 50 }),
  registroNumero:    varchar('registro_numero',    { length: 50 }),

  // ── Estado y tratamiento ──────────────────────────────────────────────────
  statusTratamiento: operacionStatusEnum('status_tratamiento').notNull().default('nuevo'),
  fechaTratamiento:  date('fecha_tratamiento'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type InsertOperacion  = typeof operaciones.$inferInsert;
export type SelectOperacion  = typeof operaciones.$inferSelect;
export type OperacionStatus  = typeof operacionStatusEnum.enumValues[number];
