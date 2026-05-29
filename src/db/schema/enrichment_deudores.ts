import {
  pgTable, serial, integer, varchar, text,
  boolean, timestamp, jsonb,
} from 'drizzle-orm/pg-core';
import { operacionEnrichments } from './enrichment';
import { nplTipoRegistroEnum } from './npl';

export const enrichmentDeudores = pgTable('enrichment_deudores', {
  id: serial('id').primaryKey(),

  enrichmentId: integer('enrichment_id')
    .notNull()
    .references(() => operacionEnrichments.id, { onDelete: 'cascade' }),

  esPrincipal:  boolean('es_principal').notNull().default(false),
  tipoRegistro: nplTipoRegistroEnum('tipo_registro').notNull().default('DEUDOR'),

  nombre:            varchar('nombre',           { length: 255 }).notNull(),
  dni:               varchar('dni',              { length: 20  }),
  direccionCompleta: text('direccion_completa'),
  estadoOcupacional: text('estado_ocupacional'),
  vulnerabilidad:    text('vulnerabilidad'),
  notas:             text('notas'),
  otrosDatos:        jsonb('otros_datos')
    .$type<{ titulo: string; nombre: string }[]>()
    .notNull()
    .default([]),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InsertEnrichmentDeudor = typeof enrichmentDeudores.$inferInsert;
export type SelectEnrichmentDeudor = typeof enrichmentDeudores.$inferSelect;
