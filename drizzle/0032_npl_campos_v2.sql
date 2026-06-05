-- Migration: 0032_npl_campos_v2

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "property_id"     varchar(50),
  ADD COLUMN IF NOT EXISTS "enrichment_id"   integer,
  ADD COLUMN IF NOT EXISTS "tasacion_actual" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_tasacion"  date,
  ADD COLUMN IF NOT EXISTS "notas_ocupacion" text;
