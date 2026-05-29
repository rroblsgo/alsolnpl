-- Migration: 0024_add_nota_simple_fields
-- Añade campos JSONB para almacenar datos extraídos de nota simple
-- y la URL del PDF subido a UploadThing

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "nota_simple_url"          varchar(512),
  ADD COLUMN IF NOT EXISTS "nota_simple_fecha"        date,
  ADD COLUMN IF NOT EXISTS "nota_simple_csv"          varchar(50),
  ADD COLUMN IF NOT EXISTS "nota_simple_registro"     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_registral"    jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_inmueble"     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_titularidad"  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_cargas"       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_otros"        jsonb NOT NULL DEFAULT '[]'::jsonb;
