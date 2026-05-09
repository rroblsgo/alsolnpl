import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

// Tipos de entidad a los que puede asociarse un documento
export const documentEntityTypeEnum = pgEnum('document_entity_type', [
  'NPL',
  'TASK',
  // Extensible: 'CLIENTE', 'EXPEDIENTE', etc.
]);

// Categorías del documento (independiente del contexto)
export const documentCategoryEnum = pgEnum('document_category', [
  'ESCRITURA',
  'NOTA_SIMPLE',
  'TASACION',
  'CONTRATO',
  'JUDICIAL',
  'CATASTRO',
  'IDENTIFICACION',
  'FINANCIERO',
  'CORRESPONDENCIA',
  'FOTOGRAFIA',
  'OTRO',
]);

export const document = pgTable('documents', {
  id: serial('id').primaryKey(),

  // Título descriptivo — obligatorio
  titulo: varchar('titulo', { length: 255 }).notNull(),

  // URL en UploadThing
  url: text('url').notNull(),

  // Nombre original del archivo tal como se subió
  nombreArchivo: varchar('nombre_archivo', { length: 255 }),

  // Extensión / tipo MIME detectado
  extension: varchar('extension', { length: 20 }),

  // Tamaño en bytes (opcional, para mostrar en UI)
  tamano: integer('tamano'),

  // Categoría del documento
  categoria: documentCategoryEnum('categoria').notNull().default('OTRO'),

  // Notas adicionales opcionales
  notas: text('notas'),

  // ── Relación polimórfica ────────────────────────────────────────────────
  entityType: documentEntityTypeEnum('entity_type').notNull(),
  entityId: integer('entity_id').notNull(),

  // ── Control ─────────────────────────────────────────────────────────────
  uploadedBy: text('uploaded_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type DocumentEntityType =
  (typeof documentEntityTypeEnum.enumValues)[number];
export type DocumentCategory =
  (typeof documentCategoryEnum.enumValues)[number];
