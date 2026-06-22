import {
  pgEnum,
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { npl } from './npl';
import { users } from './auth-schema';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const expedienteTipoNotaEnum = pgEnum('expediente_tipo_nota', [
  'comercial',
  'economico',
  'legal_proceso',
  'otros',
]);

export const expedienteRelevanciaEnum = pgEnum('expediente_relevancia', [
  'alta',
  'media',
  'baja',
]);

export const expedienteStatusEnum = pgEnum('expediente_status', [
  'completar',
  'revisar',
  'ok',
]);

// ─── Tipo JSONB ───────────────────────────────────────────────────────────────

export type NotaExpedienteItem = {
  fecha: string;                // ISO date YYYY-MM-DD
  titulo: string;               // required, max 255
  contenido?: string;           // TipTap HTML, opcional
  documentos_upload?: string[]; // URLs UploadThing, opcional
};

// ─── Tabla ────────────────────────────────────────────────────────────────────

export const expedienteNotas = pgTable('expediente_notas', {
  id: serial('id').primaryKey(),

  nplId: integer('npl_id')
    .notNull()
    .references(() => npl.id, { onDelete: 'cascade' }),

  tipoNota: expedienteTipoNotaEnum('tipo_nota')
    .notNull()
    .default('otros'),

  relevanciaNota: expedienteRelevanciaEnum('relevancia_nota')
    .notNull()
    .default('media'),

  statusNota: expedienteStatusEnum('status_nota')
    .notNull()
    .default('completar'),

  notaItems: jsonb('nota_items')
    .$type<NotaExpedienteItem[]>()
    .notNull()
    .default([]),

  usuarioRelacionadoId: text('usuario_relacionado_id')
    .references(() => users.id, { onDelete: 'set null' }),

  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type InsertExpedienteNota = typeof expedienteNotas.$inferInsert;
export type SelectExpedienteNota = typeof expedienteNotas.$inferSelect;
export type ExpedienteTipoNota   = (typeof expedienteTipoNotaEnum.enumValues)[number];
export type ExpedienteRelevancia = (typeof expedienteRelevanciaEnum.enumValues)[number];
export type ExpedienteStatus     = (typeof expedienteStatusEnum.enumValues)[number];
