-- Migration: 0025_enrichment_seccion_a_c
-- Sección A: + titulo_operacion
-- Sección C: - tipo_via, - zonas_comunes
--            + superficie_detalles, distribucion_resumida, distribucion
--            + datos_registro, notas_ocupacion

ALTER TABLE "public"."operacion_enrichments"
  -- Sección A
  ADD COLUMN IF NOT EXISTS "titulo_operacion"      varchar(255),
  -- Sección C — eliminar
  DROP COLUMN IF EXISTS "tipo_via",
  DROP COLUMN IF EXISTS "zonas_comunes",
  -- Sección C — añadir
  ADD COLUMN IF NOT EXISTS "superficie_detalles"   text,
  ADD COLUMN IF NOT EXISTS "distribucion_resumida" varchar(255),
  ADD COLUMN IF NOT EXISTS "distribucion"          text,
  ADD COLUMN IF NOT EXISTS "datos_registro"        text,
  ADD COLUMN IF NOT EXISTS "notas_ocupacion"       text;
