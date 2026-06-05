-- Migration: 0028_enrichment_seccion_d

ALTER TABLE "public"."operacion_enrichments"
  -- Eliminar campos obsoletos
  DROP COLUMN IF EXISTS "estado_legal",
  DROP COLUMN IF EXISTS "fase_judicial",
  DROP COLUMN IF EXISTS "subfase_judicial",
  DROP COLUMN IF EXISTS "partido_judicial",
  DROP COLUMN IF EXISTS "total_cargas",
  DROP COLUMN IF EXISTS "cargas_preferentes",
  DROP COLUMN IF EXISTS "cargas_posteriores",
  DROP COLUMN IF EXISTS "ibi_pendiente",
  DROP COLUMN IF EXISTS "comunidad_pendiente",
  DROP COLUMN IF EXISTS "suministros_pendientes",
  DROP COLUMN IF EXISTS "usufructo",
  DROP COLUMN IF EXISTS "servidumbres",
  DROP COLUMN IF EXISTS "tipo_garantia",
  DROP COLUMN IF EXISTS "rango_garantia",
  DROP COLUMN IF EXISTS "garantia_cruzada",
  -- Añadir nuevos campos
  ADD COLUMN IF NOT EXISTS "procedimiento"            "npl_procedimiento",
  ADD COLUMN IF NOT EXISTS "ejecutante"               varchar(255),
  ADD COLUMN IF NOT EXISTS "auto_despacho_ejecucion"  text,
  ADD COLUMN IF NOT EXISTS "actuaciones_judiciales"   jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "riesgos_juridicos"        text,
  ADD COLUMN IF NOT EXISTS "cargas"                   text,
  ADD COLUMN IF NOT EXISTS "notas_internas"           text;
