import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  numeric,
  boolean,
  date,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { operaciones } from './operaciones';
import { users } from './auth-schema';
import { nplProcedimientoEnum } from './npl';

export const enrichmentFuenteEnum = pgEnum('enrichment_fuente', [
  'fondo_banco',
  'catastro',
  'registro',
  'juzgado',
  'visita_campo',
  'elaboracion',
  'otro',
]);

export const enrichmentStatusPromocionEnum = pgEnum('enrichment_status_promocion', [
  'en_curso',
  'desestimado',
  'promocionado',
]);

export type SeccionesCompletadas = {
  a: boolean; b: boolean; c: boolean;
  d: boolean; e: boolean; f: boolean;
};

export type NotaSimpleItem = { nombre: string; contenido: string };

export const operacionEnrichments = pgTable('operacion_enrichments', {
  id: serial('id').primaryKey(),

  operacionId: integer('operacion_id')
    .notNull()
    .references(() => operaciones.id, { onDelete: 'cascade' })
    .unique(),

  nplId:              integer('npl_id'),
  statusPromocionNpl: enrichmentStatusPromocionEnum('status_promocion_npl').default('en_curso'),

  // ── A. Identificadores ────────────────────────────────────────────────────
  tituloOperacion: varchar('titulo_operacion', { length: 255 }),
  sellerReference: varchar('seller_reference', { length: 100 }),
  originalLender:  varchar('original_lender',  { length: 255 }),
  idufir:          varchar('idufir',           { length: 50  }),
  cru:             varchar('cru',              { length: 50  }),

  // ── B. Datos préstamo — fechas ────────────────────────────────────────────
  fechaOriginacion:       date('fecha_originacion'),
  fechaClasificacionNpl:  date('fecha_clasificacion_npl'),
  fechaVencimiento:       date('fecha_vencimiento'),
  fechaCompraCartera:     date('fecha_compra_cartera'),
  fechaInicioAccionLegal: date('fecha_inicio_accion_legal'),
  // B — principal original
  principalOriginal:   numeric('principal_original',   { precision: 14, scale: 2 }),
  // B2 — Datos AFS (certificación de deuda al título ejecutivo)
  principalAFS:  numeric('principal_afs',  { precision: 14, scale: 2 }),
  interesesAFS:  numeric('intereses_afs',  { precision: 14, scale: 2 }),
  costasAFS:     numeric('costas_afs',     { precision: 14, scale: 2 }),
  // deuda_total_afs = principalAFS + interesesAFS + costasAFS (calculado, no almacenado)
  fechaAFS:      date('fecha_afs'),
  // B3 — Deuda actualizada
  intereses:     numeric('intereses',      { precision: 14, scale: 2 }),
  costas:        numeric('costas',         { precision: 14, scale: 2 }),
  // deuda_actualizada = deuda_total_afs + intereses + costas (calculado, no almacenado)
  fechaCalculada: date('fecha_calculada'),
  // B — valoraciones
  tasacionOriginal:      numeric('tasacion_original', { precision: 14, scale: 2 }),
  tasacionActual:        numeric('tasacion_actual',   { precision: 14, scale: 2 }),
  fechaTasacion:         date('fecha_tasacion'),
  prestamoHipotecaDetalles: text('prestamo_hipoteca_detalles'),

  // ── C. Datos inmueble — identificadores de inmueble ──────────────────────
  propertyId:    varchar('property_id',   { length: 50  }), // ← nuevo
  tipoInmueble:  varchar('tipo_inmueble', { length: 100 }), // ← nuevo
  // C — localización
  comunidadAutonoma: varchar('comunidad_autonoma', { length: 100 }),
  provincia:         varchar('provincia',          { length: 100 }),
  municipio:         varchar('municipio',          { length: 100 }),
  municipioId:       integer('municipio_id'),
  codPostal:         varchar('cod_postal',         { length: 10  }),
  nombreVia:         varchar('nombre_via',         { length: 200 }),
  numero:            varchar('numero',             { length: 20  }),
  bloque:            varchar('bloque',             { length: 20  }),
  planta:            varchar('planta',             { length: 20  }),
  puerta:            varchar('puerta',             { length: 20  }),
  latitud:           numeric('latitud',            { precision: 12, scale: 8 }),
  longitud:          numeric('longitud',           { precision: 12, scale: 8 }),
  // C — catastro
  referenciaCatastral: varchar('referencia_catastral', { length: 25  }),
  usoCatastral:        varchar('uso_catastral',        { length: 100 }),
  valorRefCatastral:   numeric('valor_ref_catastral',  { precision: 14, scale: 2 }),
  valorCatastral:      numeric('valor_catastral',      { precision: 14, scale: 2 }),
  superficieConst:     numeric('superficie_const',     { precision: 10, scale: 2 }),
  superficieUtil:      numeric('superficie_util',      { precision: 10, scale: 2 }),
  superficieParcela:   numeric('superficie_parcela',   { precision: 10, scale: 2 }),
  superficieDetalles:  text('superficie_detalles'),
  distribucionResumida: varchar('distribucion_resumida', { length: 255 }),
  distribucion:        text('distribucion'),
  datosRegistro:       text('datos_registro'),
  anyConstruccion:     integer('any_construccion'),
  // C — registro
  idufirReg:         varchar('idufir_reg',          { length: 50  }),
  fincaRegistral:    varchar('finca_registral',     { length: 50  }),
  libro:             varchar('libro',               { length: 50  }),
  tomo:              varchar('tomo',                { length: 50  }),
  folio:             varchar('folio',               { length: 50  }),
  registroProvincia: varchar('registro_provincia',  { length: 100 }),
  registroCiudad:    varchar('registro_ciudad',     { length: 100 }),
  registroNumero:    varchar('registro_numero',     { length: 50  }),
  // C — características
  dormitorios:           integer('dormitorios'),
  banyos:                integer('banyos'),
  garaje:                boolean('garaje'),
  plazasGaraje:          integer('plazas_garaje'),
  trastero:              boolean('trastero'),
  ascensor:              boolean('ascensor'),
  jardin:                boolean('jardin'),
  piscina:               boolean('piscina'),
  estadoConservacion:    varchar('estado_conservacion',    { length: 50 }),
  certificadoEnergetico: varchar('certificado_energetico', { length: 5  }),
  // C — ocupación
  estadoOcupacion:           varchar('estado_ocupacion',  { length: 50   }),
  tipoOcupante:              varchar('tipo_ocupante',     { length: 50   }),
  rentaMensual:              numeric('renta_mensual',     { precision: 10, scale: 2 }),
  vencimientoAlquiler:       date('vencimiento_alquiler'),
  restriccionesUrbanisticas: text('restricciones_urbanisticas'),
  notasOcupacion:            text('notas_ocupacion'),

  // ── D. Procedimiento judicial ─────────────────────────────────────────────
  procedimiento:       nplProcedimientoEnum('procedimiento'),
  ejecutante:          varchar('ejecutante',          { length: 255 }),
  juzgado:             varchar('juzgado',              { length: 255 }),
  numeroProcedimiento: varchar('numero_procedimiento', { length: 50  }),
  fechaSubasta:        date('fecha_subasta'),
  numeroSubasta:       varchar('numero_subasta',       { length: 20  }),
  fechaAdjudicacion:   date('fecha_adjudicacion'),
  tipoAdjudicacion:    varchar('tipo_adjudicacion',    { length: 50  }),
  autoDespachoEjecucion: text('auto_despacho_ejecucion'),
  actuacionesJudiciales: jsonb('actuaciones_judiciales')
    .$type<{ fecha: string; titulo: string }[]>()
    .notNull()
    .default([]),
  riesgosJuridicos: text('riesgos_juridicos'),
  cargas:           text('cargas'),
  embargos:         text('embargos'),
  notasInternas:    text('notas_internas'),

  // ── E. Deudores ───────────────────────────────────────────────────────────
  numeroDeudores:   integer('numero_deudores'),
  tieneAvalistas:   boolean('tiene_avalistas'),
  provinciaDeudor:  varchar('provincia_deudor',  { length: 100 }),
  situacionLaboral: varchar('situacion_laboral', { length: 50  }),
  nivelIngresos:    varchar('nivel_ingresos',    { length: 50  }),
  ratingSolvencia:  varchar('rating_solvencia',  { length: 20  }),
  notasDeudores:    text('notas_deudores'),

  // ── F. Estrategia ─────────────────────────────────────────────────────────
  // F1 — Rentabilidad (idéntico a gestion_npl)
  costeAdquisicionCredito: numeric('coste_adquisicion_credito', { precision: 14, scale: 2 }),
  impuestosAjd:            numeric('impuestos_ajd',             { precision: 14, scale: 2 }),
  costesNotariaRegistro:   numeric('costes_notaria_registro',   { precision: 14, scale: 2 }),
  gastosDacion:            numeric('gastos_dacion',             { precision: 14, scale: 2 }),
  comisionIntermediacion:  numeric('comision_intermediacion',   { precision: 14, scale: 2 }),
  pujaProbable:            numeric('puja_probable',             { precision: 14, scale: 2 }),
  precioMercado:           numeric('precio_mercado',            { precision: 14, scale: 2 }),
  precioVentaRapida:       numeric('precio_venta_rapida',       { precision: 14, scale: 2 }),
  fechaCompra:             date('fecha_compra'),
  fechaTerminacion:        date('fecha_terminacion'),
  gastosDiversos:          jsonb('gastos_diversos')
    .$type<{ titulo: string; valor: number }[]>()
    .notNull()
    .default([]),
  // F2 — Estrategia
  estrategiaRecuperacion: varchar('estrategia_recuperacion', { length: 50  }),
  prioridad:              varchar('prioridad',               { length: 20  }),
  oportunidadInversion:   varchar('oportunidad_inversion',  { length: 50  }),
  recuperacionEsperada:   numeric('recuperacion_esperada',  { precision: 14, scale: 2 }),
  plazoRecuperacion:      integer('plazo_recuperacion'),
  riesgoRating:           varchar('riesgo_rating',          { length: 20  }),
  clusterGeografico:      varchar('cluster_geografico',     { length: 100 }),
  gestorAsignado:         varchar('gestor_asignado',        { length: 100 }),
  notasObservaciones:     text('notas_observaciones'),
  estadoDocumentacion:    varchar('estado_documentacion',   { length: 20  }),
  escrituraDisponible:    boolean('escritura_disponible'),
  antiguedadNotaSimple:   date('antiguedad_nota_simple'),

  // ── Nota simple registral ─────────────────────────────────────────────────
  notaSimpleUrl:         varchar('nota_simple_url',         { length: 512 }),
  notaSimpleFecha:       date('nota_simple_fecha'),
  notaSimpleCsv:         varchar('nota_simple_csv',         { length: 50  }),
  notaSimpleRegistro:    jsonb('nota_simple_registro')
                           .$type<NotaSimpleItem[]>().notNull().default([]),
  notaSimpleRegistral:   jsonb('nota_simple_registral')
                           .$type<NotaSimpleItem[]>().notNull().default([]),
  notaSimpleInmueble:    jsonb('nota_simple_inmueble')
                           .$type<NotaSimpleItem[]>().notNull().default([]),
  notaSimpleTitularidad: jsonb('nota_simple_titularidad')
                           .$type<NotaSimpleItem[]>().notNull().default([]),
  notaSimpleCargas:      jsonb('nota_simple_cargas')
                           .$type<NotaSimpleItem[]>().notNull().default([]),
  notaSimpleOtros:       jsonb('nota_simple_otros')
                           .$type<NotaSimpleItem[]>().notNull().default([]),

  // ── Control completitud ───────────────────────────────────────────────────
  seccionesCompletadas: jsonb('secciones_completadas')
    .$type<SeccionesCompletadas>()
    .notNull()
    .default({ a: false, b: false, c: false, d: false, e: false, f: false }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
});

export const enrichmentSources = pgTable('enrichment_sources', {
  id:           serial('id').primaryKey(),
  enrichmentId: integer('enrichment_id')
    .notNull()
    .references(() => operacionEnrichments.id, { onDelete: 'cascade' }),
  campo:      varchar('campo',      { length: 100 }).notNull(),
  fuente:     enrichmentFuenteEnum('fuente').notNull(),
  fechaDato:  date('fecha_dato'),
  notas:      text('notas'),
  archivoUrl: varchar('archivo_url', { length: 512 }),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  creatorId:  text('creator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
});

export type InsertEnrichment       = typeof operacionEnrichments.$inferInsert;
export type SelectEnrichment       = typeof operacionEnrichments.$inferSelect;
export type InsertEnrichmentSource = typeof enrichmentSources.$inferInsert;
export type SelectEnrichmentSource = typeof enrichmentSources.$inferSelect;
export type EnrichmentFuente       = typeof enrichmentFuenteEnum.enumValues[number];
