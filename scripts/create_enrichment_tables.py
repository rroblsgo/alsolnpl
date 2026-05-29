#!/usr/bin/env python3
"""
Sprint 1 — Enrichment: genera el fichero de migración Drizzle.
Ejecutar desde la raíz del proyecto:
  python3 scripts/migrations/create_enrichment_tables.py

El fichero resultante se coloca en drizzle/ con el nombre apropiado.
Ajusta el número de secuencia (XXXX) al siguiente disponible en tu carpeta drizzle/.
"""

import os

# ── Ajusta este número al siguiente disponible en tu carpeta drizzle/ ─────────
SEQ = "0020"
NAME = "enrichment_tables"

MIGRATION = f"""\
-- Migration: {SEQ}_{NAME}
-- Sprint 1: tablas operacion_enrichments y enrichment_sources
-- Generado por scripts/migrations/create_enrichment_tables.py

-- ─── Enum: fuente del dato ────────────────────────────────────────────────────
CREATE TYPE "public"."enrichment_fuente" AS ENUM(
  'fondo_banco',
  'catastro',
  'registro',
  'juzgado',
  'visita_campo',
  'elaboracion',
  'otro'
);

-- ─── Tabla principal: operacion_enrichments ───────────────────────────────────
CREATE TABLE IF NOT EXISTS "public"."operacion_enrichments" (
  "id"                        serial PRIMARY KEY,
  "operacion_id"              integer NOT NULL UNIQUE
                                REFERENCES "public"."operaciones"("id") ON DELETE CASCADE,
  "npl_id"                    integer,

  -- A. Identificadores y referencias
  "seller_reference"          varchar(100),
  "original_lender"           varchar(255),
  "idufir"                    varchar(50),
  "cru"                       varchar(50),

  -- B. Datos préstamo — fechas
  "fecha_originacion"         date,
  "fecha_impago"              date,
  "fecha_clasificacion_npl"   date,
  "fecha_ultimo_pago"         date,
  "fecha_vencimiento"         date,
  "fecha_compra_cartera"      date,
  "fecha_inicio_accion_legal" date,
  -- B. Datos préstamo — financieros
  "principal_original"        numeric(14,2),
  "principal_pendiente"       numeric(14,2),
  "intereses_devengados"      numeric(14,2),
  "deuda_total"               numeric(14,2),
  "gbv"                       numeric(14,2),
  "tipo_interes"              numeric(6,4),
  "cuota_mensual"             numeric(14,2),
  "ltv"                       numeric(6,4),
  "meses_impago"              integer,
  -- B. Datos préstamo — valoraciones
  "tasacion_original"         numeric(14,2),
  "tasacion_actual"           numeric(14,2),
  "fecha_tasacion"            date,
  "valor_mercado"             numeric(14,2),
  "valor_ejecucion_forzosa"   numeric(14,2),
  "precio_subasta"            numeric(14,2),
  "precio_venta"              numeric(14,2),

  -- C. Datos inmueble — localización normalizada
  "comunidad_autonoma"        varchar(100),
  "provincia"                 varchar(100),
  "municipio"                 varchar(100),
  "municipio_id"              integer,
  "cod_postal"                varchar(10),
  "tipo_via"                  varchar(50),
  "nombre_via"                varchar(200),
  "numero"                    varchar(20),
  "bloque"                    varchar(20),
  "planta"                    varchar(20),
  "puerta"                    varchar(20),
  "latitud"                   numeric(12,8),
  "longitud"                  numeric(12,8),
  -- C. Datos inmueble — catastro
  "referencia_catastral"      varchar(25),
  "uso_catastral"             varchar(100),
  "valor_ref_catastral"       numeric(14,2),
  "valor_catastral"           numeric(14,2),
  "superficie_const"          numeric(10,2),
  "superficie_util"           numeric(10,2),
  "superficie_parcela"        numeric(10,2),
  "zonas_comunes"             numeric(10,2),
  "any_construccion"          integer,
  -- C. Datos inmueble — registro
  "idufir_reg"                varchar(50),
  "finca_registral"           varchar(50),
  "libro"                     varchar(50),
  "tomo"                      varchar(50),
  "folio"                     varchar(50),
  "registro_provincia"        varchar(100),
  "registro_ciudad"           varchar(100),
  "registro_numero"           varchar(50),
  -- C. Datos inmueble — características
  "dormitorios"               integer,
  "banyos"                    integer,
  "garaje"                    boolean,
  "plazas_garaje"             integer,
  "trastero"                  boolean,
  "ascensor"                  boolean,
  "jardin"                    boolean,
  "piscina"                   boolean,
  "estado_conservacion"       varchar(50),
  "certificado_energetico"    varchar(5),
  -- C. Datos inmueble — ocupación
  "estado_ocupacion"          varchar(50),
  "tipo_ocupante"             varchar(50),
  "renta_mensual"             numeric(10,2),
  "vencimiento_alquiler"      date,
  "restricciones_urbanisticas" text,

  -- D. Procedimiento judicial
  "estado_legal"              varchar(50),
  "fase_judicial"             varchar(50),
  "subfase_judicial"          varchar(100),
  "juzgado"                   varchar(255),
  "partido_judicial"          varchar(100),
  "numero_procedimiento"      varchar(50),
  "fecha_subasta"             date,
  "numero_subasta"            varchar(20),
  "fecha_adjudicacion"        date,
  "tipo_adjudicacion"         varchar(50),
  -- D. Cargas y gravámenes
  "total_cargas"              numeric(14,2),
  "cargas_preferentes"        numeric(14,2),
  "cargas_posteriores"        numeric(14,2),
  "ibi_pendiente"             numeric(10,2),
  "comunidad_pendiente"       numeric(10,2),
  "suministros_pendientes"    numeric(10,2),
  "embargos"                  text,
  "usufructo"                 boolean,
  "servidumbres"              text,
  -- D. Garantías
  "tipo_garantia"             varchar(50),
  "rango_garantia"            varchar(10),
  "garantia_cruzada"          boolean,

  -- E. Deudores
  "numero_deudores"           integer,
  "tiene_avalistas"           boolean,
  "provincia_deudor"          varchar(100),
  "situacion_laboral"         varchar(50),
  "nivel_ingresos"            varchar(50),
  "rating_solvencia"          varchar(20),
  "notas_deudores"            text,

  -- F. Estrategia y clasificación
  "estrategia_recuperacion"   varchar(50),
  "prioridad"                 varchar(20),
  "oportunidad_inversion"     varchar(50),
  "recuperacion_esperada"     numeric(14,2),
  "plazo_recuperacion"        integer,
  "riesgo_rating"             varchar(20),
  "cluster_geografico"        varchar(100),
  "gestor_asignado"           varchar(100),
  "notas_observaciones"       text,
  "estado_documentacion"      varchar(20),
  "escritura_disponible"      boolean,
  "antiguedad_nota_simple"    date,

  -- Control de completitud por sección
  "secciones_completadas"     jsonb NOT NULL DEFAULT
    '{{"a":false,"b":false,"c":false,"d":false,"e":false,"f":false}}'::jsonb,

  -- Timestamps
  "created_at"  timestamp NOT NULL DEFAULT now(),
  "updated_at"  timestamp NOT NULL DEFAULT now(),
  "creator_id"  text NOT NULL REFERENCES "public"."user"("id") ON DELETE RESTRICT
);

-- ─── Tabla de trazabilidad: enrichment_sources ───────────────────────────────
CREATE TABLE IF NOT EXISTS "public"."enrichment_sources" (
  "id"            serial PRIMARY KEY,
  "enrichment_id" integer NOT NULL
                    REFERENCES "public"."operacion_enrichments"("id") ON DELETE CASCADE,
  "campo"         varchar(100) NOT NULL,
  "fuente"        "public"."enrichment_fuente" NOT NULL,
  "fecha_dato"    date,
  "notas"         text,
  "archivo_url"   varchar(512),
  "created_at"    timestamp NOT NULL DEFAULT now(),
  "creator_id"    text NOT NULL REFERENCES "public"."user"("id") ON DELETE RESTRICT
);

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_enrichment_operacion
  ON "public"."operacion_enrichments"("operacion_id");

CREATE INDEX IF NOT EXISTS idx_enrichment_npl
  ON "public"."operacion_enrichments"("npl_id")
  WHERE "npl_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enrichment_sources_enrichment
  ON "public"."enrichment_sources"("enrichment_id");
"""

# ── Escribir el fichero ───────────────────────────────────────────────────────
out_dir = os.path.join("drizzle")
os.makedirs(out_dir, exist_ok=True)

filename = f"{SEQ}_{NAME}.sql"
filepath = os.path.join(out_dir, filename)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(MIGRATION)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: bun run db:migrate")
