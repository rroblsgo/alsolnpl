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

export const enrichmentFuenteEnum = pgEnum('enrichment_fuente', [
  'fondo_banco',
  'catastro',
  'registro',
  'juzgado',
  'visita_campo',
  'elaboracion',
  'otro',
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

  nplId: integer('npl_id'),

  // ── A. Identificadores ────────────────────────────────────────────────────
  sellerReference: varchar('seller_reference', { length: 100 }),
  originalLender:  varchar('original_lender',  { length: 255 }),
  idufir:          varchar('idufir',           { length: 50  }),
  cru:             varchar('cru',              { length: 50  }),

  // ── B. Datos préstamo — fechas ────────────────────────────────────────────
  fechaOriginacion:       date('fecha_originacion'),
  fechaImpago:            date('fecha_impago'),
  fechaClasificacionNpl:  date('fecha_clasificacion_npl'),
  fechaUltimoPago:        date('fecha_ultimo_pago'),
  fechaVencimiento:       date('fecha_vencimiento'),
  fechaCompraCartera:     date('fecha_compra_cartera'),
  fechaInicioAccionLegal: date('fecha_inicio_accion_legal'),
  // B — financieros
  principalOriginal:   numeric('principal_original',   { precision: 14, scale: 2 }),
  principalPendiente:  numeric('principal_pendiente',  { precision: 14, scale: 2 }),
  interesesDevengados: numeric('intereses_devengados', { precision: 14, scale: 2 }),
  deudaTotal:          numeric('deuda_total',          { precision: 14, scale: 2 }),
  gbv:                 numeric('gbv',                  { precision: 14, scale: 2 }),
  tipoInteres:         numeric('tipo_interes',         { precision: 6,  scale: 4 }),
  cuotaMensual:        numeric('cuota_mensual',        { precision: 14, scale: 2 }),
  ltv:                 numeric('ltv',                  { precision: 6,  scale: 4 }),
  mesesImpago:         integer('meses_impago'),
  // B — valoraciones
  tasacionOriginal:      numeric('tasacion_original',      { precision: 14, scale: 2 }),
  tasacionActual:        numeric('tasacion_actual',        { precision: 14, scale: 2 }),
  fechaTasacion:         date('fecha_tasacion'),
  valorMercado:          numeric('valor_mercado',          { precision: 14, scale: 2 }),
  valorEjecucionForzosa: numeric('valor_ejecucion_forzosa',{ precision: 14, scale: 2 }),
  precioSubasta:         numeric('precio_subasta',         { precision: 14, scale: 2 }),
  precioVenta:           numeric('precio_venta',           { precision: 14, scale: 2 }),

  // ── C. Datos inmueble — identificadores de inmueble ──────────────────────
  propertyId:    varchar('property_id',   { length: 50  }), // ← nuevo
  tipoInmueble:  varchar('tipo_inmueble', { length: 100 }), // ← nuevo
  // C — localización
  comunidadAutonoma: varchar('comunidad_autonoma', { length: 100 }),
  provincia:         varchar('provincia',          { length: 100 }),
  municipio:         varchar('municipio',          { length: 100 }),
  municipioId:       integer('municipio_id'),
  codPostal:         varchar('cod_postal',         { length: 10  }),
  tipoVia:           varchar('tipo_via',           { length: 50  }),
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
  zonasComunes:        numeric('zonas_comunes',        { precision: 10, scale: 2 }),
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

  // ── D. Procedimiento judicial ─────────────────────────────────────────────
  estadoLegal:         varchar('estado_legal',         { length: 50  }),
  faseJudicial:        varchar('fase_judicial',        { length: 50  }),
  subfaseJudicial:     varchar('subfase_judicial',     { length: 100 }),
  juzgado:             varchar('juzgado',              { length: 255 }),
  partidoJudicial:     varchar('partido_judicial',     { length: 100 }),
  numeroProcedimiento: varchar('numero_procedimiento', { length: 50  }),
  fechaSubasta:        date('fecha_subasta'),
  numeroSubasta:       varchar('numero_subasta',       { length: 20  }),
  fechaAdjudicacion:   date('fecha_adjudicacion'),
  tipoAdjudicacion:    varchar('tipo_adjudicacion',    { length: 50  }),
  // D — cargas
  totalCargas:           numeric('total_cargas',           { precision: 14, scale: 2 }),
  cargasPreferentes:     numeric('cargas_preferentes',     { precision: 14, scale: 2 }),
  cargasPosteriores:     numeric('cargas_posteriores',     { precision: 14, scale: 2 }),
  ibiPendiente:          numeric('ibi_pendiente',          { precision: 10, scale: 2 }),
  comunidadPendiente:    numeric('comunidad_pendiente',    { precision: 10, scale: 2 }),
  suministrosPendientes: numeric('suministros_pendientes', { precision: 10, scale: 2 }),
  embargos:              text('embargos'),
  usufructo:             boolean('usufructo'),
  servidumbres:          text('servidumbres'),
  // D — garantías
  tipoGarantia:    varchar('tipo_garantia',  { length: 50 }),
  rangoGarantia:   varchar('rango_garantia', { length: 10 }),
  garantiaCruzada: boolean('garantia_cruzada'),

  // ── E. Deudores ───────────────────────────────────────────────────────────
  numeroDeudores:   integer('numero_deudores'),
  tieneAvalistas:   boolean('tiene_avalistas'),
  provinciaDeudor:  varchar('provincia_deudor',  { length: 100 }),
  situacionLaboral: varchar('situacion_laboral', { length: 50  }),
  nivelIngresos:    varchar('nivel_ingresos',    { length: 50  }),
  ratingSolvencia:  varchar('rating_solvencia',  { length: 20  }),
  notasDeudores:    text('notas_deudores'),

  // ── F. Estrategia ─────────────────────────────────────────────────────────
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
