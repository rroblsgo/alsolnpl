import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth-schema';

export type TablePreferences = {
  columnOrder:      string[];
  columnVisibility: Record<string, boolean>;
};

export const DEFAULT_OPERACIONES_ORDER: string[] = [
  // Identificación
  'statusTratamiento',
  'comunidadAutonoma',
  'provincia',
  'municipio',
  'direccionCompleta',
  'codPostal',
  'referenciaCatastral',
  'idufir',
  'parcel',
  // Expediente / préstamo
  'expedienteId',
  'prestamoId',
  'propertyId',
  'nplReo',
  // Financiero
  'deuda',
  'precioVentaMercado',
  'valorTasacionSubasta',
  'rangoLienPrestamo',
  // Inmueble
  'propertyTipo',
  'propertyTipoOcupacion',
  'superficieConst',
  'superficieUtil',
  'superficieFinca',
  'superficieRegistral',
  'anyConstruccion',
  'esVpo',
  'esVulnerable',
  // Deudor
  'deudorNombre',
  'fechaAlta',
  // Procedimiento legal
  'procLegal',
  'procLegalTipo',
  'procLegalFase',
  'procLegalNumero',
  'procLegalCourt',
  'procLegalEstado',
  // Registro
  'registroProvincia',
  'registroCiudad',
  'registroNumero',
  // Gestión
  'assetManager',
  'oficinaResponsable',
  'fechaTratamiento',
];

export const userTablePreferences = pgTable('user_table_preferences', {
  id:        serial('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tableKey:  text('table_key').notNull(),   // 'operaciones', 'npls', etc.
  prefs:     jsonb('prefs').$type<TablePreferences>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type SelectUserTablePreferences = typeof userTablePreferences.$inferSelect;
