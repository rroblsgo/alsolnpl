import { pgTable, varchar, index } from 'drizzle-orm/pg-core';

/**
 * Tabla de municipios españoles (INE)
 * 8.124 registros — no se incluye en el bundle del cliente,
 * se consulta exclusivamente desde el servidor vía API route.
 */
export const municipios = pgTable(
  'municipios',
  {
    municipioId: varchar('municipio_id', { length: 5 }).primaryKey(), // ej. "41091"
    provinciaId: varchar('provincia_id', { length: 2 }).notNull(),    // ej. "41"
    nombre: varchar('nombre', { length: 100 }).notNull(),
  },
  (table) => [
    index('idx_municipios_provincia').on(table.provinciaId),
    index('idx_municipios_nombre').on(table.nombre),
  ]
);

export type SelectMunicipio = typeof municipios.$inferSelect;
