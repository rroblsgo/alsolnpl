import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  numeric,
  jsonb,
  integer,
  date,
} from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

// ─── Tipos JSONB ──────────────────────────────────────────────────────────────
export type ContactoItem = { titulo: string; valor: string };
export type MapItem      = { columna_name_origen: string; campo_operaciones: string };

// ─── Tabla fondos ─────────────────────────────────────────────────────────────
export const fondos = pgTable('fondos', {
  id: serial('id').primaryKey(),

  // A. Datos básicos
  nombre:      varchar('nombre',       { length: 255 }).notNull(),
  dni:         varchar('dni',          { length: 20  }),
  empresa:     varchar('empresa',      { length: 255 }),
  nif:         varchar('nif',          { length: 20  }),
  imagen:      varchar('imagen',       { length: 255 }),
  direccion:   varchar('direccion',    { length: 255 }),
  municipio:   varchar('municipio',    { length: 100 }),
  provincia:   varchar('provincia',    { length: 100 }),
  codigoPostal:varchar('codigo_postal',{ length: 10  }),

  // B. Contactos
  emails:    jsonb('emails').$type<ContactoItem[]>().notNull().default([]),
  telefonos: jsonb('telefonos').$type<ContactoItem[]>().notNull().default([]),
  contactos: jsonb('contactos').$type<ContactoItem[]>().notNull().default([]),

  // C. Perfil inversor
  comisionGestion: numeric('comision_gestion', { precision: 6, scale: 4 }),

  // D. Gestión interna
  notas: text('notas'),

  // Control
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

// ─── Tabla carteras ───────────────────────────────────────────────────────────
export const carteras = pgTable('carteras', {
  id: serial('id').primaryKey(),

  fondoId: integer('fondo_id')
    .notNull()
    .references(() => fondos.id, { onDelete: 'cascade' }),

  // A. Datos básicos
  carteraName:        varchar('cartera_name',        { length: 100 }).notNull(),
  excelFile:          varchar('excel_file',           { length: 50  }),
  excelUrl:           varchar('excel_url',            { length: 512 }), // URL UploadThing
  assetManager:       varchar('asset_manager',        { length: 100 }),
  oficinaResponsable: varchar('oficina_responsable',  { length: 100 }),
  comisionGestion:    numeric('comision_gestion',     { precision: 6, scale: 4 }),

  // Mapeo columnas Excel -> campos operaciones
  mapItems: jsonb('map_items').$type<MapItem[]>().notNull().default([]),

  // Control
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  fechaDefinicion: date('fecha_definicion'),
});
