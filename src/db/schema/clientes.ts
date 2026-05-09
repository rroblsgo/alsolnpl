import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const clienteEstadoEnum = pgEnum('cliente_estado', [
  'PROSPECTO',
  'ACTIVO',
  'INACTIVO',
  'DESCARTADO',
]);

export const clientePerfilEnum = pgEnum('cliente_perfil_inversor', [
  'PARTICULAR',
  'FAMILY_OFFICE',
  'ASESOR_PROFESIONAL',
  'INMOBILIARIA',
]);

export const clienteOcupacionEnum = pgEnum('cliente_ocupacion', [
  'EMPRESARIO',
  'DIRECTIVO',
  'PROFESIONAL_LIBERAL',
  'INVERSOR_TIEMPO_COMPLETO',
  'JUBILADO',
  'OTRO',
]);

export const clienteRangoCapitalEnum = pgEnum('cliente_rango_capital', [
  'HASTA_25K',
  '25K_50K',
  '50K_100K',
  '100K_250K',
  '250K_500K',
  'MAS_500K',
]);

export const clienteFuenteEnum = pgEnum('cliente_fuente_captacion', [
  'REFERIDO',
  'WEB',
  'LINKEDIN',
  'EVENTO',
  'OTRO',
]);

// ─── Tipo JSONB para arrays de contacto ──────────────────────────────────────

export type ContactoItem = { titulo: string; valor: string };

// ─── Tabla clientes ───────────────────────────────────────────────────────────

export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),

  // A. Datos básicos
  nombre: varchar('nombre', { length: 255 }).notNull(),
  dni: varchar('dni', { length: 20 }),
  empresa: varchar('empresa', { length: 255 }),
  nif: varchar('nif', { length: 20 }),
  imagen: varchar('imagen', { length: 255 }),
  direccion: varchar('direccion', { length: 255 }),
  provincia: varchar('provincia', { length: 100 }),
  municipio: varchar('municipio', { length: 100 }),
  codigoPostal: varchar('codigo_postal', { length: 10 }),

  // B. Contacto (JSONB arrays de {titulo, valor})
  emails: jsonb('emails').$type<ContactoItem[]>().notNull().default([]),
  telefonos: jsonb('telefonos').$type<ContactoItem[]>().notNull().default([]),
  contactos: jsonb('contactos').$type<ContactoItem[]>().notNull().default([]),

  // C. Perfil inversor
  perfilInversor: clientePerfilEnum('perfil_inversor'),
  ocupacionPrincipal: clienteOcupacionEnum('ocupacion_principal'),
  rangoCapitalInvertir: clienteRangoCapitalEnum('rango_capital_invertir'),
  activosInteresado: text('activos_interesado').array().notNull().default([]),
  experienciaPreviaDetalle: text('experiencia_previa_detalle'),
  informadoNplDetalle: text('informado_npl_detalle'),

  // D. Gestión interna
  estado: clienteEstadoEnum('estado').notNull().default('PROSPECTO'),
  fuenteCaptacion: clienteFuenteEnum('fuente_captacion'),
  notas: text('notas'),
  consentimientoRgpd: boolean('consentimiento_rgpd').notNull().default(false),
  fechaConsentimiento: timestamp('fecha_consentimiento'),

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

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type ClienteEstado        = (typeof clienteEstadoEnum.enumValues)[number];
export type ClientePerfil        = (typeof clientePerfilEnum.enumValues)[number];
export type ClienteOcupacion     = (typeof clienteOcupacionEnum.enumValues)[number];
export type ClienteRangoCapital  = (typeof clienteRangoCapitalEnum.enumValues)[number];
export type ClienteFuente        = (typeof clienteFuenteEnum.enumValues)[number];
